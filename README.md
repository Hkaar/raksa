# RAKSA Backend

Fondasi API Python/FastAPI untuk pelaporan gigitan hewan, dengan kontrak kasus dan observasi yang akan dihubungkan ke Supabase.

## Menjalankan di PowerShell

Gunakan Python 3.10 atau lebih baru dari root proyek.

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
.venv/Scripts/python -m uvicorn app.main:app --reload
```

Swagger tersedia di http://127.0.0.1:8000/docs dan OpenAPI di http://127.0.0.1:8000/openapi.json.

```powershell
.venv/Scripts/python -m pytest -q
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
```

## Endpoint tahap pertama

| Endpoint | Perilaku saat ini |
| --- | --- |
| GET /api/v1/health | 200 dengan status ok untuk proses API |
| POST /api/v1/cases | Memvalidasi CaseCreate, lalu 503 persistence_not_configured |
| POST /api/v1/cases/{case_id}/observations | Memvalidasi UUID dan ObservationCreate, lalu 503 persistence_not_configured |

Respons 201 di OpenAPI mendefinisikan kontrak sukses untuk tahap persistensi. Frontend harus menangani 503 sebagai laporan yang belum tersimpan. Pemeriksaan koneksi database akan ditambahkan setelah integrasi.

Contoh payload kasus untuk Swagger adalah sebagai berikut.

```json
{
  "story": "Digigit anjing saat berjalan",
  "occurred_at": "2026-11-06T18:00:00+08:00",
  "animal": {"species": "dog", "ownership": "unknown"},
  "bleeding_reported": null
}
```

Contoh payload observasi adalah sebagai berikut.

```json
{
  "observed_at": "2026-11-07T08:00:00+08:00",
  "notes": "Hewan masih dapat diamati"
}
```

Waktu wajib menyertakan zona waktu. Informasi hewan dan media opsional. Null pada bleeding_reported berarti belum diketahui. Input tambahan yang belum masuk kontrak ditolak dengan 422 agar kesalahan frontend terlihat. Respons validasi berisi loc dan type tanpa mengulang nilai input.

## Konfigurasi

RAKSA_APP_NAME mengatur judul API. RAKSA_CORS_ORIGINS berupa array JSON origin frontend yang diizinkan. Default tanpa .env adalah daftar kosong. Simpan kredensial di .env yang diabaikan Git.

## Pekerjaan berikutnya

Tentukan autentikasi dan hak akses pelapor/petugas, terapkan skema cases/observations, kemudian hubungkan operasi penyimpanan. Rancangan tabel tersedia di [docs/database.md](docs/database.md).

Ekstraksi cerita, antrean, rujukan fasilitas, dan aturan urgensi masuk tahap berikutnya. Endpoint scan video tersedia sebagai usulan visual yang belum tersimpan. Output vision harus dikonfirmasi pengguna. Darah yang tidak terlihat pada video tetap diperlakukan sebagai ketidakpastian. Aturan klinis memerlukan validasi tenaga kesehatan.

## Scan video luka (eksperimen MVP)

Frontend merekam video 5–10 detik lalu mengirim **Blob mentah** ke
`POST /api/v1/scans/wound` (bukan `FormData`). Endpoint menerima `video/mp4`
atau `video/webm`, maksimum 12 MiB. Durasi rekaman saat ini diatur di frontend;
backend belum memverifikasi durasi dari metadata video. Tampilkan persetujuan
pengguna sebelum mengirim video karena video akan diproses oleh Gemini.

Tambahkan kunci ini ke `.env` lokal (jangan ke Git):

```dotenv
RAKSA_GEMINI_API_KEY=isi_kunci_dari_google_ai_studio
# Opsional:
RAKSA_GEMINI_MODEL=gemini-3.8-flash
RAKSA_GEMINI_TIMEOUT_SECONDS=12
```

Contoh panggilan dari Git Bash:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/scans/wound \
  -H 'Content-Type: video/mp4' --data-binary '@contoh-luka.mp4'
```

Respons `mode: "ai"` berisi usulan `body_part`, `blood_visibility`
(`visible`, `not_visible`, atau `unclear`), dan `wound_count` bila jelas.
`not_visible` hanya berarti darah **tidak tampak dalam video**, bukan bukti
tidak terjadi perdarahan. Jangan menyalin nilai ini ke `bleeding_reported`;
tanyakan dan konfirmasi jawaban pengguna. Endpoint tidak menghitung kategori,
urgensi, diagnosis, atau ukuran luka. Bila kunci kosong, Gemini gagal, atau
video kurang jelas, respons `mode: "manual"` meminta frontend memakai formulir.
Backend tidak menyimpan video atau hasil scan ke Supabase pada endpoint ini.

### Konteks kejadian untuk scan

Frontend dapat mengirim query `reported_event` berdasarkan jawaban pengguna:
`dog_bite`, `other_animal_contact`, `fall`, atau `unknown` (default).
Jangan mengisi `dog_bite` otomatis hanya karena pengguna membuka RAKSA.

```bash
curl -X POST 'http://127.0.0.1:8000/api/v1/scans/wound?reported_event=dog_bite' \
  -H 'Content-Type: video/mp4' --data-binary '@contoh-luka.mp4'
```

Respons menambahkan `suggestion.visible_features` berupa daftar deskripsi visual:
`puncture_like_marks`, `abrasion_like_area`, `irregular_open_edges`,
`crust_like_area`, atau `redness`. Daftar kosong berarti tidak ada ciri yang
cukup jelas untuk dilaporkan, bukan berarti kulit utuh atau tidak ada paparan.
Riwayat kejadian dan deskripsi visual tidak boleh digabung menjadi dugaan penyebab
atau angka probabilitas gigitan. Tanda seperti tusukan tidak membuktikan spesies;
ketiadaan tusukan tidak menyingkirkan gigitan. Keropeng tidak menetapkan tahap
penyembuhan ataupun menurunkan urgensi.

Dua contoh video yang diberikan pengguna memiliki riwayat **menurut pengguna**:
video telapak tangan = gigitan anjing; video tungkai = jatuh di aspal.
Riwayat ini bukan label hasil inferensi video atau validasi klinis. Gunakan keduanya
sebagai contoh evaluasi, bukan aturan umum bentuk luka. Uji juga variasi gigitan
berbentuk robekan/lecet, tanda menyerupai tusukan dari penyebab lain, video buram,
dan darah yang tidak tampak. Tes otomatis saat ini memverifikasi kontrak serta
pengiriman konteks dengan respons tiruan; belum mengukur akurasi model pada video.

Referensi gambar tambahan dari pengguna (8 November 2026):
`codex-clipboard-b6a02920-eb8c-445b-a15e-f4042dbffe4c.png`.
Riwayat menurut pengguna: gigitan anjing. Pengamatan visual awal: beberapa tanda
menyerupai tusukan, tepi tidak beraturan pada sebagian area, serta kemerahan.
Label riwayat tidak disimpulkan dari gambar. Kedalaman, ukuran, tingkat keparahan,
dan kategori paparan belum ditetapkan. Daftar ciri ini adalah catatan peninjauan
awal, bukan label klinis tervalidasi atau hasil panggilan Gemini.

Contoh-contoh ini merupakan bahan evaluasi prompt untuk model siap pakai, bukan
pelatihan ulang/fine-tuning. File media tidak disalin ke repo atau otomatis dikirim
ke Gemini. Endpoint saat ini hanya menerima video MP4/WebM; PNG ini belum bisa
dikirim langsung ke endpoint scan. Sebelum memasukkannya ke kumpulan uji bersama,
catat sumber dan izin penggunaan gambar; keduanya belum diketahui.

Rujukan bentuk luka: [HSE, Bites treatment guideline](https://assets.hse.ie/media/documents/Bites_treatment_guideline_-_dog_cat_or_human.pdf).
Prompt ada di `app/services/gemini_vision.py` pada `PROMPT`.

## Login petugas (MVP)

Supabase Auth memverifikasi password; backend menerima username dan memetakannya
ke email internal `<username>@<domain>`. Username 3–32 karakter: huruf, angka,
titik, garis bawah, atau tanda hubung; huruf besar dinormalisasi menjadi kecil.
Atur `.env` lokal:

```dotenv
RAKSA_SUPABASE_URL=https://PROJECT_REF.supabase.co
RAKSA_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ISI_DARI_DASHBOARD
RAKSA_OFFICER_EMAIL_DOMAIN=officers.example.org
```

Gunakan domain tetap yang disepakati tim, bukan otomatis `example.org`. Buat
akun petugas secara administratif di Supabase Auth dengan email sesuai pola
tersebut, dan berikan `app_metadata.role` bernilai `officer` melalui operasi
administratif tepercaya. Jangan menggunakan `user_metadata` untuk role dan
jangan membuka registrasi publik sebagai cara menjadi petugas. Provisioning
akun dan role belum diotomatisasi; jangan berbagi secret key ke frontend.

- `POST /api/v1/officer/auth/login`: JSON `username`, `password`; hasil berisi access token, refresh token, masa berlaku, dan ID petugas.
- `GET /api/v1/officer/auth/me`: header `Authorization: Bearer <access_token>`; memeriksa sesi dan role ke Supabase.
- `POST /api/v1/officer/auth/refresh`: JSON `refresh_token`; menerima pasangan token baru.
- `POST /api/v1/officer/auth/logout`: Bearer token; meminta Supabase mengakhiri sesi.

401 berarti kredensial/sesi ditolak, 403 berarti bukan petugas, 503 berarti
layanan belum dikonfigurasi atau tidak tersedia. Logout tidak serta-merta
membatalkan access token yang sudah diterbitkan; gunakan masa berlaku singkat
dan tinjau kebijakan sesi sebelum penggunaan data sensitif. Terapkan HTTPS,
penyimpanan token yang aman dan pembatasan percobaan login sebelum deployment.
Endpoint kasus/antrean belum dilindungi atau dihubungkan ke login ini. Tes
saat ini menggunakan respons tiruan; belum diuji pada proyek Supabase live.

## Shortcut masuk sebagai petugas

Tombol frontend “Demo sebagai officer” memanggil `POST /api/v1/officer/auth/shortcut` tanpa body. Respons sukses sama dengan login petugas: access token, refresh token, waktu berlaku, dan officer. Frontend menggunakan alur dan halaman petugas biasa. Jika belum diaktifkan atau dikonfigurasi, endpoint mengembalikan 503.

Shortcut memberikan sesi akun tersebut kepada siapa pun yang memanggilnya. Gunakan **proyek Supabase demo terpisah**, akun petugas khusus, dan data contoh saja; jangan aktifkan pada proyek yang memuat data nyata. Isolasi ini harus disiapkan dalam konfigurasi deployment, bukan dilakukan otomatis oleh backend. Jangan taruh kredensial di frontend atau Git. Di environment server demo:

```dotenv
RAKSA_OFFICER_SHORTCUT_ENABLED=true
RAKSA_OFFICER_SHORTCUT_EMAIL=akun-demo@example.org
RAKSA_OFFICER_SHORTCUT_PASSWORD=isi-password-akun-demo
```

Akun harus sudah ada pada Supabase Auth dan memiliki `app_metadata.role` = `officer`. Tambahkan konfigurasi URL dan publishable key seperti bagian login. Endpoint shortcut belum diuji ke Supabase live.

## Tabel dan seeder profil petugas

SQL tabel `officers` tersedia di [docs/officers.sql](docs/officers.sql); jalankan sekali di SQL Editor. Seeder profil ada di `scripts/seed_officer.py` dan memerlukan akun yang sudah dibuat di Supabase Auth. Seeder tidak membuat akun/password atau menetapkan role; itu dilakukan admin di Supabase Auth. Password dikelola Supabase Auth dan tidak dimasukkan ke seeder.

Git Bash, dari root repo:

```bash
export SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxx"
export SUPABASE_SECRET_KEY="sb_secret_"
export SUPABASE_OFFICER_ID="xxxxxxxxxxxxxxxxxxxx"
export SUPABASE_OFFICER_NAME="KADEK DIMAS"
export SUPABASE_OFFICER_ORGANIZATION="RSUD Wangaya"
export SUPABASE_OFFICER_PHONE="0813333313"
./.venv/Scripts/python.exe scripts/seed_officer.py --check
./.venv/Scripts/python.exe scripts/seed_officer.py --apply
```

`SUPABASE_OFFICER_ID` harus sama dengan User UID dari akun Auth; organisasi dan nomor telepon boleh dikosongkan. `--apply` membuat atau memperbarui profil berdasarkan ID. Simpan secret key hanya di terminal privat; jangan commit atau kirim ke frontend. Tabel menyimpan profil, bukan password. Role `app_metadata` tetap perlu ditetapkan secara administratif. Seeder belum dijalankan ke database live.

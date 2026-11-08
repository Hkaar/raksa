# Konteks proyek RAKSA

RAKSA membantu pelaporan dan penanganan awal gigitan hewan penular rabies. Wireframe pen.dev dan PRD menjadi referensi yang dapat berubah; keputusan pengguna terbaru menjadi acuan.

## Stack dan struktur

Python, FastAPI, Pydantic, Supabase PostgreSQL, dan Gemini untuk bantuan vision. `app/api/` berisi route, `app/services/` integrasi eksternal, `app/schemas.py` dan `app/scan_schemas.py` kontrak input/output, `tests/` pengujian, `scripts/seed.py` seed. Detail cara menjalankan ada di `README.md`.

## Kondisi dan batasan MVP

- Endpoint health tersedia; POST kasus dan observasi tersimpan ke Supabase dengan respons 201. Kegagalan konfigurasi/koneksi tetap menghasilkan 503.
- Scan menerima video MP4/WebM sebagai body mentah, memberi saran visual atau fallback manual. Hasil perlu dikonfirmasi; backend belum memvalidasi durasi dan tidak menyimpan video atau hasil scan.
- Darah tidak tampak bukan bukti tidak ada perdarahan dan tidak boleh menurunkan urgensi. Riwayat kejadian dari pengguna terpisah dari pengamatan visual. Gemini tidak menetapkan penyebab atau keparahan luka.
- Kasus dan observasi adalah tabel utama untuk laporan; profil petugas dirancang pada tabel officers, dan informasi hewan di kasus. Fitur owner ditunda. Foto hewan dan kartu vaksin opsional.
- Rujukan, antrean petugas, dan perhitungan urgensi masih perlu dikerjakan; endpoint bantuan cerita tersedia, integrasi frontend/persistensi belum selesai. Validasi klinis oleh tenaga kesehatan diperlukan sebelum digunakan untuk keputusan klinis.
- Login petugas menerima email atau username yang dipetakan ke email internal Supabase Auth; role diperiksa dari app_metadata. Provisioning akun tetap administratif; otorisasi observasi sudah aktif. Jangan menganggap respons API atau role baru sebagai standar final tanpa memeriksa kontrak dan kebutuhan frontend.

Semua path relatif dalam dokumen ini mengacu pada direktori `backend/`.

## Menjalankan dari Git Bash (di direktori backend)

```bash
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload
./.venv/Scripts/python.exe -m pytest -q
```

Simpan kredensial di `.env`, jangan cetak atau bagikan nilainya. Sebelum mengirim video ke Gemini, aplikasi perlu memperoleh persetujuan pengguna.

## Keputusan dan alur tambahan

- **Login petugas:** backend saat ini menerima username dan password; username dipetakan ke email internal Supabase. Contoh desain login memakai email sebagai ilustrasi; kontrak login perlu diselaraskan dengan frontend bila tim memilih email langsung.
- **Perubahan alur — shortcut akun petugas:** tombol “Demo sebagai officer” memanggil `POST /api/v1/officer/auth/shortcut`. Backend masuk menggunakan akun Supabase yang disiapkan di server dan mengembalikan sesi yang sama bentuknya dengan login biasa; frontend masuk ke halaman officer biasa. Endpoint `GET /api/v1/officer/demo` dan data demo statis telah dihapus.
- Shortcut nonaktif secara default. Saat diaktifkan, siapa saja yang bisa memanggilnya memperoleh sesi akun tersebut. Gunakan proyek Supabase terpisah berisi data contoh; jangan aktifkan pada proyek yang berisi data nyata. Backend tidak otomatis memisahkan data. Kredensial disimpan di environment server.
- **Tambahan database — officers:** tabel profil terkait `auth.users`; password tetap dikelola Supabase Auth. Login saat ini masih memeriksa `app_metadata.role`, belum membaca atau memvalidasi keberadaan baris officers. SQL tersedia di `docs/officers.sql`; seeder profil untuk user Auth yang sudah ada ada di `scripts/seed_officer.py`. Keduanya belum dijalankan pada Supabase live. Akun Auth/password dan role tetap perlu disiapkan admin.

- **Alur tambahan — cerita suara/teks:** `POST /stories/transcribe` mengubah audio menjadi teks yang dapat diedit; teks yang dikonfirmasi dikirim ke `POST /stories/extract` untuk usulan detail lalu dikonfirmasi kembali. Semua path berprefiks `/api/v1`. Ketik langsung melewati transkripsi; formulir singkat dapat melewati AI. Endpoint tidak menyimpan data dan tidak memberi diagnosis/urgensi.
- **Keputusan bahasa:** Bahasa Indonesia/Inggris untuk MVP, Bahasa Bali dikeluarkan dari scope sesuai arahan pengguna. Gemini memakai key/model yang sama dengan scan, hanya di server.
- **Batasan integrasi:** audio maksimum 8 MiB; frontend membatasi rekaman satu menit, durasi belum divalidasi backend. Waktu/lokasi diekstrak sebagai frasa tanpa menebak tanggal/koordinat; detail yang tidak dinyatakan tetap null. Endpoint kasus menyimpan hasil konfirmasi sesuai kontrak; frontend perlu memetakan draft ke payload.

- **Perubahan struktur:** seluruh aplikasi backend, requirements, dokumen, `.ai/`, `.env`, dan environment Python dipindahkan ke `backend/` agar repo dapat menampung frontend. Git tetap pada root; jalankan Uvicorn, seed dan tes dari `backend/`. Tidak mengubah URL endpoint.

- **Perubahan model Gemini:** pengujian langsung 8 November 2026 menunjukkan `gemini-3.8-flash` timeout untuk permintaan teks sederhana, sementara `gemini-3.5-flash-lite` berhasil memproses video contoh. Default model dan `.env` lokal diubah ke Flash Lite; default timeout menjadi 45 detik. Log hanya mencatat jenis error/status, tanpa media atau key. Ini bukan validasi klinis.

- **Perubahan alur — persistensi:** POST kasus terbuka untuk pelaporan warga, mengembalikan hanya baris yang baru dibuat. POST observasi memerlukan sesi dan role officer yang diverifikasi Supabase; source ditetapkan server. Role owner belum didukung. Secret key server tidak diberikan ke frontend.
- **Tambahan kontrak:** kasus menerima village, victim_age_group dan wound (event_type/body_part/wound_count/skin_broken); status/urgency tetap tidak bisa ditetapkan klien. Panduan FE ada di `docs/frontend-integration.md`; FE dari main masih menyimpan draft lokal dan belum otomatis mengirim laporan.
- **Verifikasi:** skema live dibaca melalui OpenAPI, POST kasus berhasil 201 dan tersimpan; observasi berhasil 201 pada uji DB dengan Auth tiruan. Data uji sementara dihapus. 50 tes otomatis lulus; login petugas live masih perlu diuji.

- **Perubahan alur — login email:** mengikuti kebutuhan kolom login frontend, login menerima tepat salah satu email/username + password. Username tetap memakai domain terkonfigurasi. Auth dapat memakai secret backend yang sudah ada jika publishable key tidak disediakan; tidak pernah dikirim ke klien.
- **Audit integrasi:** seluruh 11 route existing menjalankan layanan sebenarnya; login, me, refresh, logout, shortcut dan observasi diuji dengan akun Supabase sintetis sementara lalu dibersihkan. Ekstraksi cerita dan transkripsi suara sintetis diuji live. 51 tes lulus. Shortcut tetap nonaktif lokal; akun permanen dan frontend wiring masih perlu disiapkan. Status terperinci dan fitur belum tersedia ada di docs/frontend-integration.md.

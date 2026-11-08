# Membuat laporan dari frontend

Jalankan backend dari `backend/` di port 8000. Server harus dikonfigurasi dengan URL dan secret Supabase; jangan memasukkan secret ke frontend. Set origin frontend melalui `RAKSA_CORS_ORIGINS`.

## POST /api/v1/cases

Tidak memerlukan login warga. `story` wajib; field lain opsional. Kirim jawaban yang sudah dikonfirmasi. Contoh:

```ts
const response = await fetch("http://localhost:8000/api/v1/cases", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    story: "Kemarin saya digigit anjing di jalan",
    occurred_at: null,
    village: "Desa Contoh",
    location: null,
    wound: { event_type: "bite", body_part: "tangan", wound_count: 1 },
    animal: { species: "dog", ownership: "unknown", vaccination_status: "unknown" },
    bleeding_reported: null
  })
});
const result = await response.json();
if (!response.ok) throw new Error(`Laporan belum berhasil disimpan (HTTP ${response.status})`);
// Hanya tampilkan sukses dan bersihkan draft setelah 201. Simpan result.id.
```

Respons 201 berisi data laporan, UUID `id`, `created_at`, dan status `reported` dari database. Jangan kirim `id`, `created_at`, `status` atau `urgency` dari frontend. `null` pada perdarahan berarti belum diketahui. Lokasi memakai `{latitude, longitude}`, bukan `{lat, lng}`. Waktu harus menyertakan zona waktu. Jangan mengirim blob URL atau seluruh draft/hasil AI tanpa pemetaan field. Tidak ada endpoint GET laporan publik pada tahap ini.

## POST /api/v1/cases/{case_id}/observations

Memerlukan `Authorization: Bearer <access_token petugas>`. Contoh JSON:

```json
{"observed_at":"2026-11-09T10:00:00+08:00","observation_day":1,"animal_condition":"healthy","notes":"Hewan masih dapat diamati"}
```

Backend menetapkan `source: officer`. Field `source` dari klien ditolak; alur owner ditunda. Notes, hari, dan kondisi opsional; observed_at wajib. Respons 201 berisi ID observasi dan case_id. Respons 401/403 untuk sesi/role tidak valid, 404 jika kasus tidak ada, 409 jika hari observasi sudah tercatat, 422 jika input tidak valid, 503 jika konfigurasi/koneksi bermasalah.

## Hasil verifikasi

51 tes otomatis lulus. POST kasus diuji ke Supabase dan diverifikasi tersimpan. POST observasi juga diuji ke database dengan sesi petugas Supabase asli dari akun sementara. Data sintetis uji telah dihapus. Frontend saat ini masih memakai draft lokal; teman frontend perlu menghubungkan aksi kirim ke fetch di atas.

## Audit seluruh endpoint yang tersedia

Seluruh route berikut menjalankan operasi sebenarnya; tidak ada route kasus/observasi yang hanya mengembalikan stub 503. Error 503 tetap dipakai saat konfigurasi atau layanan bermasalah.

| Endpoint (prefiks /api/v1) | Perilaku | Verifikasi |
| --- | --- | --- |
| GET /health | Liveness proses API, bukan jaminan koneksi DB | Otomatis |
| POST /cases | Insert Supabase, respons 201 | Live |
| POST /cases/{id}/observations | Insert Supabase dengan verifikasi officer | Live, token asli |
| POST /scans/wound | Analisis video Gemini atau fallback manual | Live pada video contoh sebelumnya |
| POST /stories/transcribe | Transkripsi Gemini | Live, suara sintetis Inggris |
| POST /stories/extract | Ekstraksi Gemini | Live, cerita sintetis Indonesia |
| POST /officer/auth/login | Password grant Supabase dan pemeriksaan role | Live, akun uji sementara |
| GET /officer/auth/me | Verifikasi token dan role Supabase | Live |
| POST /officer/auth/refresh | Rotasi sesi lewat Supabase | Live |
| POST /officer/auth/logout | Logout sesi lewat Supabase | Live |
| POST /officer/auth/shortcut | Login akun server terkonfigurasi | Live dengan konfigurasi sementara; tetap nonaktif di konfigurasi lokal |

Akun/data sintetis yang dibuat selama audit sudah dihapus. Tabel officers terdeteksi pada skema live; endpoint me saat ini hanya mengembalikan id dan role, belum mengembalikan profil lengkap. Seeder profil tidak membuat akun Auth atau menetapkan role.

Login mendukung salah satu dari dua JSON berikut (jangan kirim keduanya):

```json
{"email":"petugas@example.com","password":"password-akun"}
```

```json
{"username":"petugas","password":"password-akun"}
```

Username memerlukan `RAKSA_OFFICER_EMAIL_DOMAIN`; email langsung tidak. Auth memilih publishable key bila ada, atau secret server yang sudah dikonfigurasi sebagai fallback. Secret hanya digunakan server untuk request ke Supabase; password, token pengguna dan role tetap diverifikasi. Publishable key dapat memakai alias SUPABASE_PUBLISHABLE_KEY atau SUPABASE_ANON_KEY.

Belum ada endpoint daftar/detail/update status kasus, antrean, fasilitas rujukan, perhitungan urgensi, pembacaan kartu vaksin/foto hewan, atau alur owner. Layar frontend untuk fitur tersebut masih perlu backend tersendiri dan belum boleh dianggap terhubung. Integrasi UI ke endpoint yang tersedia tetap perlu dilakukan tim frontend.

# Konteks proyek RAKSA

RAKSA membantu pelaporan dan penanganan awal gigitan hewan penular rabies. Wireframe pen.dev dan PRD menjadi referensi yang dapat berubah; keputusan pengguna terbaru menjadi acuan.

## Stack dan struktur

Python, FastAPI, Pydantic, Supabase PostgreSQL, dan Gemini untuk bantuan vision. `app/api/` berisi route, `app/services/` integrasi eksternal, `app/schemas.py` dan `app/scan_schemas.py` kontrak input/output, `tests/` pengujian, `scripts/seed.py` seed. Detail cara menjalankan ada di `README.md`.

## Kondisi dan batasan MVP

- Endpoint health tersedia; pembuatan kasus dan observasi masih mengembalikan 503 karena persistensi belum dihubungkan.
- Scan menerima video MP4/WebM sebagai body mentah, memberi saran visual atau fallback manual. Hasil perlu dikonfirmasi; backend belum memvalidasi durasi dan tidak menyimpan video atau hasil scan.
- Darah tidak tampak bukan bukti tidak ada perdarahan dan tidak boleh menurunkan urgensi. Riwayat kejadian dari pengguna terpisah dari pengamatan visual. Gemini tidak menetapkan penyebab atau keparahan luka.
- Kasus dan observasi adalah tabel utama untuk laporan; profil petugas dirancang pada tabel officers, dan informasi hewan di kasus. Fitur owner ditunda. Foto hewan dan kartu vaksin opsional.
- Rujukan, antrean petugas, ekstraksi cerita, dan perhitungan urgensi masih perlu dikerjakan. Validasi klinis oleh tenaga kesehatan diperlukan sebelum digunakan untuk keputusan klinis.
- Login petugas memakai username yang dipetakan ke email internal Supabase Auth; role diperiksa dari app_metadata. Provisioning dan otorisasi endpoint petugas belum selesai. Jangan menganggap respons API atau role baru sebagai standar final tanpa memeriksa kontrak dan kebutuhan frontend.

## Menjalankan dari Git Bash

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

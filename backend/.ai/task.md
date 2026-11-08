# Progres dan roadmap RAKSA

`[ ]` belum selesai · `[/]` berjalan/sebagian · `[x]` selesai dan diverifikasi sesuai catatan. Prioritas dapat diubah oleh pengguna; cek kode dan kondisi terbaru sebelum bekerja.

## Fondasi dan konteks
- [x] Fondasi FastAPI dan kontrak awal kasus/observasi; endpoint penyimpanan masih 503.
- [x] Dokumentasikan rancangan ERD dan siapkan seed sintetis. Pengguna menyampaikan tabel sudah dibuat; kondisi live dan seed belum diverifikasi.
- [x] Susun workflow konteks untuk handover.

## Scan video — eksperimen
- [x] Endpoint scan dan fallback manual; pengujian otomatis menggunakan respons Gemini tiruan.
- [/] Uji langsung Gemini dengan satu video contoh berizin: Flash Lite menghasilkan saran visual, model lama timeout. Akurasi klinis belum tervalidasi; uji variasi dan peninjauan tenaga kesehatan masih diperlukan.
- [ ] Sepakati alur konfirmasi pengguna dan penanganan privasi dengan frontend.

## Autentikasi petugas
- [/] Login username/password, me, refresh, logout melalui Supabase Auth; tes memakai provider tiruan. Konfigurasi akun/role dan uji live masih diperlukan, begitu juga otorisasi endpoint petugas.

## Demo petugas
- [/] Shortcut masuk ke akun Supabase menggunakan kredensial server; nonaktif secara default. Tes provider tiruan; akun dan proyek demo terisolasi, uji live, dan tombol frontend masih diperlukan.
- [/] Rancangan SQL tabel `officers` dan seeder profil untuk akun Auth yang sudah ada tersedia; belum diterapkan/dijalankan atau diintegrasikan ke profil API.

## Fitur MVP berikutnya — urutan dapat disepakati
- [ ] Tentukan hak akses pelapor/petugas, lalu hubungkan kasus dan observasi ke Supabase.
- [x] Endpoint transkripsi dan ekstraksi cerita dengan kontrak konfirmasi serta fallback manual; 44 tes backend lulus (provider tiruan).
- [ ] Uji transkripsi/ekstraksi langsung dengan Gemini, audio berizin, dan integrasi frontend; belum mengukur akurasi.
- [ ] Selaraskan hasil konfirmasi cerita dengan kontrak persistensi kasus.
- [ ] Aturan urgensi Python dan validasi oleh tenaga kesehatan.
- [ ] Rujukan fasilitas dan antrean petugas.
- [ ] Integrasi frontend dan pengujian alur menyeluruh.

Fitur owner ditunda. Jangan tandai selesai hanya karena skema atau kontrak sudah tersedia. Saat menyelesaikan pekerjaan, catat pengujian yang dilakukan serta hal yang masih belum diverifikasi.

## Struktur repo
- [x] Pindahkan backend ke subfolder `backend/` beserta dokumentasi dan konfigurasi lokal. Python 3.12.3, 44 tes lulus, seed --check valid dan .env terbaca dari lokasi baru. Environment lama dicadangkan lokal sebagai `.venv-before-move/` (diabaikan Git).

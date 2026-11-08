# Progres dan roadmap RAKSA

`[ ]` belum selesai · `[/]` berjalan/sebagian · `[x]` selesai dan diverifikasi sesuai catatan. Prioritas dapat diubah oleh pengguna; cek kode dan kondisi terbaru sebelum bekerja.

## Fondasi dan konteks
- [x] Fondasi FastAPI dan kontrak awal kasus/observasi; endpoint penyimpanan kini terhubung (lihat pembaruan persistensi).
- [x] Dokumentasikan rancangan ERD dan siapkan seed sintetis. Pengguna menyampaikan tabel sudah dibuat; kondisi live dan seed belum diverifikasi.
- [x] Susun workflow konteks untuk handover.

## Scan video — eksperimen
- [x] Endpoint scan dan fallback manual; pengujian otomatis menggunakan respons Gemini tiruan.
- [/] Uji langsung Gemini dengan satu video contoh berizin: Flash Lite menghasilkan saran visual, model lama timeout. Akurasi klinis belum tervalidasi; uji variasi dan peninjauan tenaga kesehatan masih diperlukan.
- [ ] Sepakati alur konfirmasi pengguna dan penanganan privasi dengan frontend.

## Autentikasi petugas
- [/] Login username/password, me, refresh, logout melalui Supabase Auth; tes otomatis dan uji Auth live berhasil dengan akun sementara; akun permanen serta wiring frontend masih perlu disiapkan.

## Demo petugas
- [/] Shortcut masuk ke akun Supabase menggunakan kredensial server; nonaktif secara default. Tes provider tiruan; akun dan proyek demo terisolasi, uji live, dan tombol frontend masih diperlukan.
- [/] Rancangan SQL tabel `officers` dan seeder profil untuk akun Auth yang sudah ada tersedia; belum diterapkan/dijalankan atau diintegrasikan ke profil API.

## Fitur MVP berikutnya — urutan dapat disepakati
- [x] Hubungkan POST kasus/observasi ke Supabase. Kasus publik untuk pelaporan; observasi membutuhkan officer. 50 tes lulus dan uji DB live berhasil dengan data sintetis yang sudah dibersihkan.
- [ ] Hubungkan tombol kirim frontend ke POST kasus; panduan tersedia di docs/frontend-integration.md.
- [x] Uji observasi dengan sesi petugas Supabase sebenarnya; akun dan data uji sementara dibersihkan.
- [x] Endpoint transkripsi dan ekstraksi cerita dengan kontrak konfirmasi serta fallback manual; 44 tes backend lulus (provider tiruan).
- [x] Uji transkripsi dan ekstraksi langsung dengan Gemini menggunakan input sintetis.
- [ ] Integrasi frontend dan evaluasi akurasi audio/cerita pada variasi input berizin.
- [ ] Selaraskan hasil konfirmasi cerita dengan kontrak persistensi kasus.
- [ ] Aturan urgensi Python dan validasi oleh tenaga kesehatan.
- [ ] Rujukan fasilitas dan antrean petugas.
- [ ] Integrasi frontend dan pengujian alur menyeluruh.

Fitur owner ditunda. Jangan tandai selesai hanya karena skema atau kontrak sudah tersedia. Saat menyelesaikan pekerjaan, catat pengujian yang dilakukan serta hal yang masih belum diverifikasi.

## Struktur repo
- [x] Pindahkan backend ke subfolder `backend/` beserta dokumentasi dan konfigurasi lokal. Python 3.12.3, 44 tes lulus, seed --check valid dan .env terbaca dari lokasi baru. Environment lama dicadangkan lokal sebagai `.venv-before-move/` (diabaikan Git).

## Audit kesiapan endpoint
- [x] Audit 11 route existing, perbaiki konfigurasi Auth/email login, dokumentasikan batasan dan uji live dengan data sintetis. 51 tes otomatis lulus.

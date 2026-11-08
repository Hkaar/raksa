# Rancangan awal backend RAKSA

## Tujuan dan batas tahap pertama

Menyiapkan fondasi FastAPI berbahasa Python untuk prototipe hackathon. Tahap pertama menyediakan health check, konfigurasi melalui environment, kontrak data kasus dan observasi, serta rancangan penyimpanan Supabase yang dapat berkembang bersama frontend. Dokumentasi harus menjelaskan cara menjalankan dan menguji layanan. Integrasi eksternal yang belum dikonfigurasi tidak boleh berpura-pura berhasil.

## Data dan API`

- Dua entitas utama adalah `cases` dan `observations`. Informasi hewan berada dalam kasus; observasi mengacu pada kasus. Foto hewan dan kartu vaksin opsional. Waktu kejadian, cerita, lokasi, informasi korban dan hewan, serta status kasus disimpan sesuai kebutuhan yang telah dikonfirmasi; detail belum diketahui tetap opsional.
- Kontrak API menggunakan validasi Pydantic dan endpoint berversi `/api/v1`. Pisahkan model permintaan dan respons, router, dan layanan agar mudah diubah. Sediakan dokumentasi OpenAPI bawaan FastAPI.
- Rancang penyimpanan dengan identitas UUID dan waktu pembuatan; hindari menambahkan tabel individu hewan. Jangan membuka akses data sensitif sampai model autentikasi dan otorisasi disepakati.
- Simpan konfigurasi dan kunci di environment, dengan contoh tanpa rahasia. Data dan media harus privat. RLS dan grants perlu diatur sesuai model akses; secret/service-role key tidak boleh masuk frontend. Akses dengan kredensial istimewa membutuhkan pemeriksaan otorisasi server sendiri.

## Tahap berikutnya

Pelaporan dan observasi persisten, antrean petugas, ekstraksi cerita, analisis video 5–10 detik, rujukan fasilitas, dan perhitungan urgensi menyusul setelah kontrak akses dan kebutuhan frontend jelas. Gemini atau model vision siap pakai dapat digunakan tanpa pelatihan model. Pisahkan usulan AI dari jawaban yang sudah dikonfirmasi pengguna. Hasil scan adalah petunjuk, bukan diagnosis; darah yang tidak terlihat tetap tidak diketahui dan tidak menurunkan urgensi. Aturan urgensi dan perhitungan klinis memerlukan validasi tenaga kesehatan sebelum digunakan untuk keputusan nyata.

## Keputusan yang masih diperlukan sebelum akses data

Tentukan apakah pelaporan anonim diperlukan, siapa yang boleh membaca atau mengubah masing-masing kasus, bagaimana petugas dibedakan dari pelapor, serta kebijakan penyimpanan dan retensi media. Tentukan juga sumber data fasilitas dan aturan klinis bersama pihak yang berwenang. Jangan menganggap rancangan awal siap produksi.

## Verifikasi

Uji health check dan validasi kontrak, termasuk bidang opsional dan hubungan kasus–observasi. Setelah Supabase dihubungkan, uji akses yang diizinkan dan ditolak serta jalur penyimpanan nyata. Uji integrasi AI dan aturan klinis hanya setelah keduanya tersedia dan disepakati.

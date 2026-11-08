# Rancangan penyimpanan Supabase

Tahap berikutnya menerapkan skema setelah hak akses pelapor dan petugas ditentukan. Dokumen ini merupakan rancangan yang belum dijalankan pada database.

| Tabel | Kolom inti | Batasan |
| --- | --- | --- |
| cases | id uuid, story text, occurred_at timestamptz nullable, location jsonb nullable, animal jsonb, bleeding_reported boolean nullable, status text, created_at timestamptz | Primary key id, status diperiksa dengan CHECK, cerita wajib |
| observations | id uuid, case_id uuid, observed_at timestamptz, notes text, created_at timestamptz | Primary key id, foreign key case_id ke cases.id, penghapusan kasus dibatasi selama observasi masih ada |

Informasi hewan berada di cases.animal. Struktur JSON mengikuti AnimalInfo pada app/schemas.py. Referensi foto dan kartu vaksin menyimpan object path pada bucket privat. Latitude dan longitude mengikuti kontrak Location.

Indeks yang direncanakan adalah observations(case_id, observed_at) dan cases(status, created_at) untuk riwayat serta antrean. UUID dan created_at dihasilkan server atau database saat penyimpanan.

Aktifkan RLS pada kedua tabel dan atur grants secara eksplisit. Kebijakan perlu membatasi kasus berdasarkan pemilik dan kewenangan petugas. Identitas pemilik harus berasal dari autentikasi terverifikasi. Hak akses observasi mengikuti kasus induknya. Secret key dengan bypass RLS memerlukan pemeriksaan akses server pada setiap operasi.

Usulan AI dan fakta terkonfirmasi akan memakai struktur terpisah sebelum integrasi vision diaktifkan. Ketidakpastian perdarahan tetap null. Perubahan urgensi memerlukan aturan tervalidasi dan versi aturan yang tercatat.

Rujukan resmi untuk tahap integrasi adalah [pengamanan Data API](https://supabase.com/docs/guides/api/securing-your-api) dan [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

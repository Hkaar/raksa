# Skema database RAKSA

Rujukan rincian kolom, tipe, constraint, ERD, SQL, dan seed: [`docs/database-erd.md`](../docs/database-erd.md). Dokumen tersebut mencatat rancangan SQL; pengguna menyampaikan bahwa dua tabel sudah dibuat di Supabase, tetapi skema live belum diverifikasi dalam sesi ini. Periksa skema live sebelum migrasi atau menyimpulkan keduanya identik.

- `cases` → `observations`: satu kasus memiliki banyak observasi melalui `observations.case_id`; SQL rancangan menggunakan `ON DELETE RESTRICT`.
- Data hewan berada di `cases.animal`; tidak ada tabel individu hewan.
- `bleeding_reported = NULL` berarti belum diketahui. Pisahkan usulan AI dari data yang dikonfirmasi.
- SQL rancangan mengaktifkan RLS dan mencabut akses `anon`/`authenticated`. Akses backend dan otorisasi masih perlu dirancang sebelum memakai data nyata.
- Jika skema berubah, perbarui dokumen ERD dan jelaskan apakah perubahan sudah diterapkan di Supabase. Jangan menjalankan SQL atau seed live tanpa instruksi pengguna.

## Tambahan: profil petugas

Rancangan `public.officers` dan SQL terpisah: [`docs/officers.sql`](../docs/officers.sql). `id` adalah PK sekaligus FK ke `auth.users.id` (on delete cascade); `full_name` wajib, `organization` dan `phone` opsional, `created_at` otomatis. RLS mengizinkan akun terautentikasi membaca profil sendiri; perubahan melalui service role/server tepercaya. SQL belum diterapkan. Tabel tidak menyimpan password dan belum dipakai oleh endpoint login.

Verifikasi terbaru: OpenAPI database live menampilkan kolom cases dan observations yang cocok. Endpoint POST kini menyimpan lewat secret server; RLS dan grants tidak diubah. Sampel sintetis berhasil dibuat dan dihapus kembali.

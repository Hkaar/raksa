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

Ekstraksi cerita, analisis video 5–10 detik, antrean, rujukan fasilitas, dan aturan urgensi masuk tahap berikutnya. Output vision harus dikonfirmasi pengguna. Darah yang tidak terlihat pada video tetap diperlakukan sebagai ketidakpastian. Aturan klinis memerlukan validasi tenaga kesehatan.

# RAKSA

Aplikasi pelaporan gigitan/cakaran hewan penular rabies. Warga melapor lewat suara, teks, atau formulir singkat, mendapat panduan pertolongan pertama dan hasil urgensi, lalu petugas meninjau kasus. Bantuan AI (Gemini) hanya memberi usulan yang wajib dikonfirmasi pengguna; RAKSA bukan alat diagnosis.

| Folder | Isi | Panduan |
| --- | --- | --- |
| [`frontend/`](frontend/) | Next.js 16, React 19, Tailwind v4 | [frontend/README.md](frontend/README.md) |
| [`backend/`](backend/) | FastAPI, Supabase (Auth + database), Gemini | [backend/README.md](backend/README.md) |

## Menjalankan lokal

Butuh Python 3.10+ dan Node.js. Jalankan backend dan frontend di dua terminal.

**Backend** (port 8000):

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt   # Windows: .venv/Scripts/python
cp .env.example .env                                     # isi kunci Supabase/Gemini
.venv/bin/python -m uvicorn app.main:app --reload
```

Swagger: http://127.0.0.1:8000/docs. Uvicorn `--reload` tidak membaca ulang `.env`; restart setelah mengubahnya.

**Frontend** (port 3000):

```bash
cd frontend
npm install
cp .env.example .env.local   # opsional; default backend http://127.0.0.1:8000
npm run dev
```

Buka http://localhost:3000. Daftar semua layar dan state ada di http://localhost:3000/demo.

## Konfigurasi penting

| Variabel | Lokasi | Fungsi |
| --- | --- | --- |
| `RAKSA_CORS_ORIGINS` | `backend/.env` | Origin frontend yang diizinkan, mis. `["http://localhost:3000"]` |
| `RAKSA_SUPABASE_URL`, `RAKSA_SUPABASE_PUBLISHABLE_KEY`, `RAKSA_OFFICER_EMAIL_DOMAIN` | `backend/.env` | Login petugas lewat Supabase Auth |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | `backend/.env` | Penyimpanan kasus/observasi (server saja) |
| `RAKSA_GEMINI_API_KEY` | `backend/.env` | Transkripsi, ekstraksi cerita, scan luka |
| `RAKSA_OFFICER_SHORTCUT_*` | `backend/.env` | Tombol "Masuk sebagai demo" (hanya untuk proyek demo) |
| `NEXT_PUBLIC_RAKSA_API_URL` | `frontend/.env.local` | URL backend tanpa `/api/v1` |

Jangan commit `.env` atau `.env.local`; contoh nilai ada di `.env.example` masing-masing.

## Status integrasi

| Fitur | Status |
| --- | --- |
| Login petugas (email/username, shortcut demo, refresh, logout) | Terhubung ke backend |
| Transkripsi suara, ekstraksi cerita, scan video luka | Terhubung (Gemini), dengan mode manual bila AI tidak tersedia |
| Kirim laporan (`POST /cases`) dan observasi petugas | Tersimpan di Supabase |
| Hasil urgensi, antrean, detail kasus, halaman pemilik, rabies center | Masih data demo (`frontend/data/demo.json`); backend belum punya endpoint baca/daftar/urgensi |

Detail kontrak API: [backend/docs/frontend-integration.md](backend/docs/frontend-integration.md). Progres dan keputusan backend: `backend/.ai/`.

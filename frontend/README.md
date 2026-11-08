# RAKSA Frontend

Next.js app for RAKSA: citizens report animal bites (voice, text, or short form), get first-aid guidance and an urgency result, and officers review cases. UI copy is Indonesian with an English toggle.

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/Radix UI, lucide-react icons, motion, Leaflet maps, Urbanist via `next/font`.

> This Next.js version has breaking changes from older releases. Check `node_modules/next/dist/docs/` before using Next APIs (see `AGENTS.md`).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional; defaults work for local dev
npm run dev
```

Open http://localhost:3000. The full feature set needs the backend running (see below); without it, screens still render with demo data and API calls fail gracefully.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npx tsc --noEmit -p .` | Type check |

## Backend

The app calls the RAKSA FastAPI backend (`../backend`) at `NEXT_PUBLIC_RAKSA_API_URL`; `/api/v1` is appended in `lib/api.ts`.

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_RAKSA_API_URL` | `http://127.0.0.1:8000` | Backend base URL without `/api/v1`. Inlined at build time: restart `next dev` or rebuild after changing it. |

The backend must list this app's origin (e.g. `http://localhost:3000`) in `RAKSA_CORS_ORIGINS`. Start it from `../backend` with `.venv/bin/uvicorn app.main:app --reload`.

Endpoints used:

| Feature | Endpoint |
| --- | --- |
| Officer login / demo shortcut / session / refresh / logout | `POST /officer/auth/login` (email or username), `POST /officer/auth/shortcut`, `GET /officer/auth/me`, `POST /officer/auth/refresh`, `POST /officer/auth/logout` |
| Voice story → text | `POST /stories/transcribe` |
| Story → suggested report fields | `POST /stories/extract` |
| Wound video scan | `POST /scans/wound` |
| Submit confirmed report | `POST /cases` |

AI features (transcribe, extract, scan) ask for consent once per tab (`components/raksa/ai-consent-sheet.tsx`); if declined, users fill fields themselves. Officer tokens live in `sessionStorage`; officer pages are wrapped in `OfficerGuard`.

## Demo data

Case results, the officer queue, case detail, observations, and the owner page (`/h/[token]`) still use `data/demo.json` and `lib/demo-store.ts`, because the backend has no read/list endpoints yet. After a report is saved, the result screen shows demo case `A7F3`. `/demo` lists every screen and state and can reset browser demo data.

## Routes

| Route | Screen |
| --- | --- |
| `/` → `/beranda` | Splash, home |
| `/pertolongan-pertama` | First aid with wash timer |
| `/lapor`, `/lapor/pertanyaan/[n]`, `/lapor/formulir` | Report by voice/text, follow-up questions, short form |
| `/lapor/scan`, `/lapor/scan/analisis`, `/lapor/scan/hasil` | Wound video scan |
| `/lapor/kartu-vaksin`, `/lapor/kartu-vaksin/hasil` | Animal vaccination card photo |
| `/lapor/konfirmasi`, `/lapor/bukan-gigitan` | Confirm and submit; not-a-bite state |
| `/kasus/[kode]`, `/kasus/[kode]/hasil`, `/kasus/[kode]/kartu` | Case status, urgency result, report card |
| `/rabies-center` | Nearest rabies centers (map) |
| `/h/[token]` | Animal owner follow-up |
| `/petugas/masuk`, `/petugas/antrean`, `/petugas/kasus/[kode]` | Officer login, queue, case detail |

Some states are reachable with `?keadaan=...` (e.g. `/kasus/A7F3/hasil?keadaan=gagal-simpan`, `/lapor?keadaan=mikrofon-ditolak`); see `/demo`.

## Project layout

```
app/                 routes; (warga) = citizen screens, petugas = officer screens
components/raksa/    app components (headers, urgency card, map, scenes, ...)
components/ui/       shadcn/Radix primitives
lib/api.ts           backend client
lib/i18n/messages/   UI copy per area (id + en)
data/demo.json       demo cases, rabies centers, question sets
public/              demo images, illustrations
```

## Design

Screens follow the pen.dev design file (`Raksa.pen`). Design tokens live in `app/globals.css`. When copy changes, update both `id` and `en` in `lib/i18n/messages/*`.

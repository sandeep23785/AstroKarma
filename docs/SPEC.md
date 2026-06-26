# Astro Karma — Build Spec

Technical specification for building the app. The **look and behavior** are defined by the
prototype in `design/reference/` and captured in [DESIGN.md](DESIGN.md). This document
covers the **architecture, data, API, and build order**.

---

## 1. Product summary

A single-user, desktop-first (mobile-capable) web app for studying Vedic astrology charts
and keeping learning notes. The user keeps a library of birth charts, opens any chart to
study it as a North-Indian diamond chart, generates positions from birth details (or places
planets by hand), writes free-form notes, switches divisional charts, and exports a chart +
notes as a Word document. Data is the user's own and synced across devices via a backend
database.

**Non-goals (for now):** multi-user/accounts beyond the single owner; predictive features
(dashas, transits) — may come later; full set of divisional charts (only D1 + D9 first).

---

## 2. Architecture

```
┌──────────────────────────┐      HTTPS/JSON      ┌───────────────────────────┐
│  Web client (React SPA)  │  ─────────────────▶  │   API (FastAPI, Python)   │
│  S3 + CloudFront, PWA    │  ◀─────────────────  │   ECR + App Runner        │
│  - 4 screens             │      JWT auth        │   - auth (Google OAuth)   │
│  - North-Indian SVG      │                      │   - ephemeris (pyswisseph)│
│  - notes editor          │                      │   - geocoding             │
│  - Word export (client)  │                      │   - CRUD charts/notes     │
└──────────────────────────┘                      │   - flashcards (Claude)*  │
                                                   └────────────┬──────────────┘
                                                                │ SQL
                                                   ┌────────────▼──────────────┐
                                                   │  PostgreSQL (RDS)          │
                                                   │  source of truth           │
                                                   └────────────────────────────┘
* later phase
```

- **Source of truth = Postgres.** The client is a thin view over server data; it never
  treats local storage as authoritative (local cache for offline/perf only).
- **Region:** `ap-south-1` (Mumbai).
- **Secrets** (Claude key, Google OAuth client secret, DB creds) live in SSM Parameter
  Store, injected as env at deploy — never in client code or the repo.

### Why these choices (decision trail)
- **Python/FastAPI backend** over all-TypeScript: the Vedic ephemeris ecosystem
  (`pyswisseph`, varga/nakshatra/dasha math) is far stronger in Python, and the future
  Claude call is trivial there.
- **Postgres over Google Drive** as the store: the Learning Library / flashcards need to
  *query* observations across charts; Drive is a file bucket and can't. Drive/Word remain
  **export targets only** (a later "backup to S3/Drive" feature), never a second source of
  truth — two stores invites sync bugs.
- **AWS over free tiers:** predictable, owned infra that won't change terms or disappear.
  Accept a small fixed monthly floor (~$20–35) in exchange for stability.

---

## 3. Frontend

- **Stack:** React 18 + Vite + TypeScript. Responsive SPA; installable PWA (offline cache
  of the app shell + last-synced data).
- **State:** Zustand for UI/session state (mirrors the prototype's flat state model);
  TanStack Query for server data (charts) — caching, optimistic updates, background refetch.
- **Styling:** plain CSS with design tokens as CSS custom properties in `:root` (see
  DESIGN.md §Tokens). No CSS framework — the design is specific and easier to hit directly.
- **Routing:** lightweight client routing for the four screens
  (`/` home, `/chart/new` + `/chart/:id/edit` create/edit, `/chart/:id` workspace,
  `/library`). The prototype models this as a `screen` enum — routes map 1:1.
- **Chart rendering:** inline SVG, drawn programmatically from `POLY`/`CEN` geometry — no
  image assets. See [CHART_GEOMETRY.md](CHART_GEOMETRY.md).
- **Word export:** stays **client-side** exactly as the prototype does it — rasterize the
  chart SVG to PNG via canvas, build a Word-compatible HTML doc, download as `.doc`. No
  backend needed. (Logic ported from `Nakshatra.dc.html` `exportDoc()`.)

### Suggested frontend layout
```
web/
├── index.html
├── vite.config.ts
├── public/
│   └── manifest.webmanifest        # PWA
└── src/
    ├── main.tsx
    ├── app/                        # routes/screens
    │   ├── HomeScreen.tsx
    │   ├── CreateScreen.tsx        # create + edit
    │   ├── ChartScreen.tsx         # workspace
    │   └── LibraryScreen.tsx
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── TopBar.tsx
    │   ├── NorthIndianChart.tsx    # SVG; props: houses, ascSign, onHouse?, selected?
    │   ├── PlanetPalette.tsx
    │   ├── NotesPanel.tsx
    │   ├── ChartCard.tsx
    │   └── Toast.tsx
    ├── lib/
    │   ├── chartGeometry.ts        # POLY, CEN, signOf()
    │   ├── astro.ts                # SIGNS, PMETA, PORDER, helpers
    │   ├── exportDoc.ts            # client-side Word export
    │   └── api.ts                  # typed fetch client (JWT)
    ├── store/                      # zustand stores
    └── styles/tokens.css           # design tokens as CSS vars
```

---

## 4. Backend

- **Stack:** Python 3.12 + FastAPI + Uvicorn, packaged as a Docker image (pushed to ECR,
  run on App Runner). `pyswisseph` plus the Swiss Ephemeris data files bundled in the image.
- **Responsibilities:** auth (Google OAuth + JWT issue/verify), geocoding, chart generation
  (ephemeris → sign/house/nakshatra; D1 + D9 vargas), chart/notes CRUD, and (later)
  flashcard generation via Claude.
- **Geocoding:** birth place string → lat/long/timezone. Start with a hosted geocoder
  (e.g. Nominatim/OpenCage) behind the backend; cache results in DB to avoid repeat calls.

### Suggested backend layout
```
api/
├── Dockerfile
├── pyproject.toml
├── ephe/                           # Swiss Ephemeris data files
└── app/
    ├── main.py                     # FastAPI app, router include, CORS
    ├── config.py                   # env/settings (SSM-injected)
    ├── auth.py                     # Google OAuth verify + JWT
    ├── deps.py                     # auth dependency, db session
    ├── db.py                       # SQLAlchemy engine/session
    ├── models.py                   # ORM models (see Data model)
    ├── schemas.py                  # Pydantic request/response
    ├── routers/
    │   ├── charts.py               # CRUD
    │   ├── generate.py             # ephemeris + geocode
    │   └── flashcards.py           # (later) Claude
    └── astro/
        ├── ephemeris.py            # pyswisseph wrapper (sidereal/Lahiri)
        ├── vargas.py               # D1, D9 (extensible)
        └── nakshatra.py
```

---

## 5. Data model

Postgres tables. (`houses`/positions stored as JSONB for flexibility; one row per chart.)

### `users`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| google_sub | text unique | Google account subject id |
| email | text | |
| created_at | timestamptz | |

### `charts`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid fk → users | |
| name | text not null | e.g. "Aarav Sharma" |
| birth_date | text | free-form display string (e.g. "14 Aug 1991") |
| birth_time | text | optional, for display |
| place | text | display string (e.g. "Pune, IN") |
| lat | double precision | nullable until generated |
| lon | double precision | nullable |
| tz | text | IANA tz, nullable |
| asc_sign | int (1–12) | ascendant (Lagna) sign |
| houses | jsonb | 12-element array of planet-code arrays (D1). e.g. `[["Su","Me"],["Ve"],…]` |
| computed | bool | true if generated from ephemeris (vs manual) |
| positions | jsonb | optional richer per-planet data (longitude, nakshatra, retro) when generated |
| vargas | jsonb | manual divisional charts keyed by varga: `{"D9": {"ascSign", "houses"}, …}` (D1 lives in `asc_sign`/`houses`) |
| created_at / updated_at | timestamptz | |

> **Planet codes:** `Su Mo Ma Me Ju Ve Sa Ra Ke`. **Signs:** 1=Aries … 12=Pisces.
> **House→sign:** `signOf(i, asc) = ((asc-1 + i) % 12) + 1` (house index `i` is 0–11).

### `notes`
One free-form note per chart now; table modeled to allow growth.
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| chart_id | uuid fk → charts | |
| body | text | the free-form note (the prototype's `notes.whole`) |
| saved_at | timestamptz | last save; drives the "Saved · <relative>" indicator |
| updated_at | timestamptz | |

### `flashcards` *(later phase — define now so the model is stable)*
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| chart_id | uuid fk → charts | source chart |
| note_id | uuid fk → notes | source note |
| front | text | question |
| back | text | answer (user's own observation) |
| tags | text[] | e.g. `{mars, 7th-house, relationships}` |
| planet | text | optional structured anchor |
| house | int | optional |
| sign | int | optional |
| created_at | timestamptz | |
| source | text | `ai` \| `manual` |

The `flashcards` table is what makes the **Learning Library** queryable ("all cards about
Mars in the 7th"). Notes stay free-form; flashcards are derived from them by Claude later.

---

## 6. API surface

All routes under `/api`, JSON, require `Authorization: Bearer <jwt>` except auth endpoints.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/google/url` | Get Google OAuth consent URL |
| GET | `/api/auth/google/callback` | OAuth callback → issue app JWT |
| GET | `/api/me` | Current user |
| GET | `/api/charts` | List charts (for gallery + sidebar) |
| POST | `/api/charts` | Create chart (manual or from generated draft) |
| GET | `/api/charts/{id}` | Get one chart (+ its note) |
| PUT | `/api/charts/{id}` | Update chart (edit) |
| POST | `/api/charts/{id}/duplicate` | Duplicate (name + " (copy)", notes copied) |
| DELETE | `/api/charts/{id}` | Delete |
| PUT | `/api/charts/{id}/note` | Save note body (stamps `saved_at`) |
| POST | `/api/generate` | Body: birth details → `{ascSign, houses, positions}` via ephemeris |
| GET | `/api/charts/{id}/varga/{key}` | Compute a divisional chart (D1, D9 now) |
| POST | `/api/charts/{id}/flashcards` | *(later)* Generate flashcards via Claude |
| GET | `/api/flashcards?planet=&house=&tag=` | *(later)* Query Learning Library |

**Note on "Save to Drive":** the prototype's *Save to Drive* button maps to
`PUT /api/charts/{id}/note` (persist to our DB) — the green "Saved" indicator reflects DB
save, not Google Drive. A real Drive/S3 *backup export* is a separate later feature.

---

## 7. Auth

- **Google OAuth** sign-in (single owner). Flow: client gets consent URL → user approves →
  callback exchanges code, backend verifies the Google ID token, finds/creates the single
  `users` row, issues a short-lived app **JWT** (+ refresh).
- Backend authorizes every request against that JWT; all data is scoped to the owner.
- Gate the app to the owner's Google `sub`/email via config (it's a personal tool on the
  open web).

---

## 8. Ephemeris & vargas (scope: D1 + D9 now)

- Use `pyswisseph` in **sidereal mode with Lahiri ayanāṁśa** (`swe_set_sid_mode(SIDM_LAHIRI)`).
- From birth date/time + lat/long/tz: compute ascendant + planetary sidereal longitudes →
  derive `asc_sign`, each planet's sign and house, and nakshatra.
- **D1 (Rāśi):** direct from sign placements. **D9 (Navāṁśa):** standard navāṁśa formula
  from longitudes (see CHART_GEOMETRY.md §Vargas). Architecture leaves room to add
  D10/D12/D24/D30/D60 later (tabs already exist in the design).
- Validate generated charts against a known reference (e.g. a public birth chart) before
  trusting output.

---

## 9. Word export (client-side, keep as-is)

Port `exportDoc()` from `Nakshatra.dc.html` to `web/src/lib/exportDoc.ts`:
1. Render the chart to a standalone SVG string (`svgMarkup`).
2. Rasterize to PNG via an offscreen canvas (`svgToPng`).
3. Build a Word-compatible HTML document: heading, meta line (date · place · Lahiri
   ayanāṁśa), chart image, planet-positions table, notes.
4. Download as `<name>.doc` with `application/msword` and a BOM prefix.

No backend involved. (Later: optional server-side email of the export via SES.)

---

## 10. Build phases

> **Status (current):** Phases 0–3 are built and verified locally. A product decision since
> then: **chart generation (Swiss Ephemeris) is disabled in the UI** and charts are placed
> **manually for every varga (D1–D60)** — stored in `charts.vargas`. The ephemeris backend
> (`/api/generate`, `app/astro`) remains intact but dormant. **Google Drive is not yet
> integrated** — "Save to Drive" persists notes to the DB; real Drive sync is backlog.
> Local API runs on **port 8077** (8000 is commonly taken); the launcher starts both tiers.

**Phase 0 — Scaffold** ✅
- Init `web/` (Vite React TS) and `api/` (FastAPI). Drop in design tokens, fonts, base
  layout (top bar + sidebar shell). Dockerfile for api. Local dev with SQLite for speed.

**Phase 1 — Frontend with mock/local data** ✅
- Build all four screens faithfully (Home, Create/Edit, Workspace, Library) + the
  North-Indian SVG, manual planet placement, search, duplicate/edit/delete, notes editor,
  toasts. Client-side Word export working.

**Phase 2 — Real backend + DB + auth** ✅
- FastAPI CRUD over Postgres/SQLite; JWT auth (dev-login locally; Google OAuth verify ready
  for prod); client wired to the API. DB is the source of truth (store = cache).

**Phase 3 — Chart generation** ✅ *(then disabled in UI by product decision)*
- Geocoding + `pyswisseph` (Lahiri); `/generate` and D1/D9 varga endpoints, built and
  verified. Superseded by **manual per-varga placement** (`charts.vargas`); the ephemeris
  code is kept dormant for later re-enable (or a future hosted-API provider).

**Phase 4 — Deploy on AWS**
- Web → S3 + CloudFront; api → ECR + App Runner; DB → RDS Postgres; secrets → SSM;
  region `ap-south-1`. Custom domain + HTTPS. PWA verified on mobile.

**Phase 5 — AI flashcards + richer Learning Library**
- `/charts/{id}/flashcards` calls Claude with note + chart context → structured cards →
  `flashcards` table. Library screen aggregates/queries real cards; add a review mode.

**Later / backlog**
- **Google Drive sync** (OAuth Drive scope + upload endpoint + token storage) to make
  "Save to Drive" real; until then notes save to the DB. Optionally a hosted ephemeris
  provider (e.g. freeastrologyapi) behind `/api/generate` to re-enable auto-generation.
- Real voice dictation (Web Speech API replacing the simulated stream); S3 backup export;
  SES email export; dashas/transits.

---

## 11. Cost (personal scale, ap-south-1)

Rough fixed floor ~**$20–35/month**: RDS `db.t4g.micro` + App Runner minimum + small
S3/CloudFront. Claude flashcard calls are pay-per-use and negligible for one user.

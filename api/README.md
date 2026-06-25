# api/ — Backend (Python + FastAPI)

Handles auth, geocoding, chart generation (Swiss Ephemeris), chart/notes CRUD over
Postgres, and (later) AI flashcard generation via Claude. See
[../docs/SPEC.md](../docs/SPEC.md) §4–§8 for the data model, API surface, and ephemeris
scope.

> Status: **scaffolded** (Phase 0 ✓). Bootable FastAPI app with CORS, settings, a
> `/api/health` endpoint, and a Dockerfile. Routers/models/ephemeris land in later phases.

## Stack
- Python 3.12 + FastAPI + Uvicorn
- SQLAlchemy + PostgreSQL (SQLite for local dev)
- `pyswisseph` (Swiss Ephemeris, sidereal / Lahiri ayanāṁśa)
- Google OAuth → backend-issued JWT
- Anthropic SDK (Claude) — later phase, flashcards
- Packaged as a Docker image → ECR + App Runner

## Intended structure
```
api/
├── Dockerfile
├── pyproject.toml
├── .env.example                # DATABASE_URL, GOOGLE_CLIENT_*, JWT_SECRET, ANTHROPIC_API_KEY
├── ephe/                       # Swiss Ephemeris data files (gitignored; fetched at build)
└── app/
    ├── main.py                 # FastAPI app, routers, CORS
    ├── config.py               # settings (SSM-injected env)
    ├── db.py                   # engine/session
    ├── deps.py                 # auth + db dependencies
    ├── auth.py                 # Google OAuth verify + JWT
    ├── models.py               # ORM: users, charts, notes, flashcards
    ├── schemas.py              # Pydantic request/response
    ├── routers/
    │   ├── charts.py           # CRUD + duplicate + note save
    │   ├── generate.py         # /generate, /varga
    │   └── flashcards.py       # (later) Claude
    └── astro/
        ├── ephemeris.py        # pyswisseph wrapper
        ├── vargas.py           # D1, D9 (extensible)
        └── nakshatra.py
```

## Endpoints (summary)
Full table in [../docs/SPEC.md](../docs/SPEC.md) §6. Highlights:
`/api/auth/google/*`, `/api/me`, `/api/charts` (CRUD + `/duplicate`, `/note`),
`/api/generate`, `/api/charts/{id}/varga/{key}`, and (later) `/api/charts/{id}/flashcards`.

## Run (local, once scaffolded)
```
uv sync           # or pip install -e .
uvicorn app.main:app --reload
```

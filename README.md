# Astro Karma

A personal, desktop-first web app for studying Vedic (Jyotish) astrology charts and
keeping learning notes against them. Maintain a library of birth charts, open any chart
to study it, write free-form notes, switch between divisional charts, and export a chart
+ notes as an editable Word document. Built as a single-user learning tool.

> Status: **Planning / pre-build.** This repo currently holds the specification and the
> design reference. No application code yet. See [docs/SPEC.md](docs/SPEC.md) for the
> build plan and [docs/DESIGN.md](docs/DESIGN.md) for the visual/UX spec.

## What it does

- **Chart library** — browse/search saved charts; add, edit, duplicate, delete.
- **Chart generation** — compute planet + ascendant positions from birth details via
  a Swiss Ephemeris backend (Lahiri ayanāṁśa). Manual planet placement also supported.
- **Chart workspace** — study a chart as a North-Indian (diamond) SVG, switch divisional
  charts (D1 + D9 now, more later), and write free-form notes per chart.
- **Word export** — export a chart image + planet table + notes as a `.doc`.
- **Learning library** — findings aggregated across charts (foundation now; AI-generated
  flashcards added in a later phase).

## Tech stack (frozen)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript (responsive SPA + PWA) |
| UI state | Zustand + TanStack Query |
| Backend | Python + FastAPI (containerized) |
| Ephemeris | `pyswisseph` (Swiss Ephemeris) |
| Database | PostgreSQL (RDS) — single source of truth |
| Auth | Google OAuth → backend-issued JWT (single user) |
| AI (later) | Claude API for flashcard generation |
| Hosting | S3 + CloudFront (web), ECR + App Runner (api), RDS (db), region `ap-south-1` |

Full rationale and the decision trail are in [docs/SPEC.md](docs/SPEC.md).

## Repository map

```
AstroKarma/
├── README.md                  ← you are here
├── docs/
│   ├── SPEC.md                ← architecture, data model, API, build phases
│   ├── DESIGN.md              ← design spec: tokens, screens, components, interactions
│   └── CHART_GEOMETRY.md      ← North-Indian SVG geometry + sign/varga math
└── design/
    └── reference/             ← the original high-fidelity prototype (source of truth for look & behavior)
        ├── Nakshatra.dc.html  ← primary design source (template + logic)
        ├── Astro Karma.html   ← self-contained runnable prototype (click through real behavior)
        ├── support.js         ← prototype runtime (reference only — do not depend on)
        ├── HANDOFF.md         ← original design handoff notes
        └── screens/           ← PNG snapshots of the four key screens
```

## Design fidelity

The wireframes, layout, copy, colors, and interactions are **fixed** — recreate the
prototype faithfully. The prototype in `design/reference/` is the authority for look and
behavior; `docs/DESIGN.md` captures the exact tokens and per-screen specs. Open
`design/reference/Astro Karma.html` in a browser to click through the intended behavior.

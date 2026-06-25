# web/ — Frontend (React + Vite + TypeScript)

Desktop-first responsive SPA + PWA. Recreates the prototype in `../design/reference/`
faithfully. See [../docs/DESIGN.md](../docs/DESIGN.md) for tokens and per-screen specs and
[../docs/CHART_GEOMETRY.md](../docs/CHART_GEOMETRY.md) for the chart SVG.

> Status: **scaffolded** (Phase 0 ✓). App shell (top bar + sidebar), routing for the four
> screens, design tokens, and the astro/geometry constants are in place; screens are stubs
> to be built out in Phase 1. `npm install && npm run dev` runs it.

## Stack
- React 18 + Vite + TypeScript
- Zustand (UI/session state) + TanStack Query (server data)
- Plain CSS with design tokens as CSS custom properties (`src/styles/tokens.css`)
- PWA (installable, offline app-shell cache)

## Intended structure
```
web/
├── index.html
├── vite.config.ts
├── package.json
├── .env.example                # VITE_API_BASE_URL, etc.
├── public/
│   └── manifest.webmanifest    # PWA
└── src/
    ├── main.tsx
    ├── app/                    # screens (route-level)
    │   ├── HomeScreen.tsx
    │   ├── CreateScreen.tsx    # create + edit
    │   ├── ChartScreen.tsx     # workspace
    │   └── LibraryScreen.tsx
    ├── components/
    │   ├── TopBar.tsx
    │   ├── Sidebar.tsx
    │   ├── NorthIndianChart.tsx   # SVG: houses, ascSign, onHouse?, selected?
    │   ├── PlanetPalette.tsx
    │   ├── NotesPanel.tsx
    │   ├── ChartCard.tsx
    │   └── Toast.tsx
    ├── lib/
    │   ├── chartGeometry.ts    # POLY, CEN, signOf()
    │   ├── astro.ts            # SIGNS, PMETA, PORDER
    │   ├── exportDoc.ts        # client-side Word export
    │   └── api.ts              # typed fetch client (JWT)
    ├── store/                  # zustand stores
    └── styles/tokens.css
```

## Routes (map to the prototype's `screen` enum)
- `/` — Home (chart gallery)
- `/chart/new`, `/chart/:id/edit` — Create / Edit
- `/chart/:id` — Workspace
- `/library` — Learning library

## Build / deploy
Static build (`vite build`) → S3 + CloudFront (see `../infra/terraform`).

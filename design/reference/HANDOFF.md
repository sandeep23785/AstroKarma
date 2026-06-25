# Handoff: Astro Karma — Vedic Astrology Learning & Notes App

## Overview
Astro Karma is a **desktop-first web app** for studying Vedic (Jyotish) astrology charts and keeping personal learning notes against them. A user keeps a library of birth charts, opens any chart to study it, writes free-form notes per chart (with voice dictation), switches between divisional charts, saves to Google Drive, and exports a chart + notes as an editable Word document.

This bundle is the design reference. The flows, layout, copy, colors, and interactions are all defined in the HTML prototype.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior. They are **not** production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (e.g. React, Vue, etc.) using its established patterns, then wire up the real backend services described under "Backend work required." If no codebase exists yet, React + a small Node/Python backend is a reasonable choice.

`Nakshatra.dc.html` is a "Design Component" — it uses a lightweight in-house runtime (`support.js`) that renders a React-like class component. Treat it as a spec, not a dependency: read the template (markup) and the `class Component` logic to understand structure, state, and handlers, then reimplement in your stack.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, and interactions are all intentional and should be recreated faithfully. Exact tokens are listed under "Design Tokens."

## Screens / Views

### 1. Charts (home)
- **Purpose:** Browse/search the chart library; entry point to open, add, edit, duplicate, or delete a chart.
- **Layout:** Left sidebar (236px) + main scroll area. Heading "Charts", then a search box (max 380px), then a responsive card grid (`repeat(auto-fill, minmax(248px, 1fr))`, 14px gap).
- **Components:**
  - **Search box** — filters cards live by name, Lagna sign, or place (case-insensitive substring). 10px radius, 1px `#E5DCC8` border, `#FBF7EF` bg, leading ⌕ glyph.
  - **Add-chart card** — dashed border `#D7C9AC`, opens the Add chart screen.
  - **Chart card** — `#FBF7EF` bg, 1px `#E5DCC8` border, 14px radius, min-height 128px. Contains: round monogram (40px, `#F1E6CF` bg, `#7A521C` text, first letter of name), name (Spectral 15px 600), sub-line `date · place` (12px `#978B73`), footer row with a "<Lagna> Lagna" pill and "<n> placed" count. Top-right **⋯** button opens a popover menu: **Open / Edit chart / Duplicate / Delete** (Delete in `#B0492B`).

### 2. Add chart / Edit chart
- **Purpose:** Create a new chart or edit an existing one. Two paths: auto-generate from birth details, or place planets by hand.
- **Layout:** Back link "← Charts", title ("New chart" or "Edit chart"), a 2-column form (`repeat(auto-fit, minmax(240px, 1fr))`, max 620px), a "Generate automatically" panel, then a 2-column area: chart (452px) on the left, planet palette + create button on the right.
- **Components:**
  - **Form fields** — Name (text), Lagna (select, 12 signs), Date of birth (text), Time & place (text). 9px radius, `#FBF7EF` bg, 1px `#E5DCC8` border.
  - **Generate panel** — heading + description + **✨ Generate** button (`#A8742B` bg, white text). On click, computes a placement (in the prototype this is a deterministic mock keyed off the inputs — in production, call the ephemeris API) and shows a "✓ Computed via ephemeris (preview)" badge.
  - **Planet palette** — 9 buttons: Su Mo Ma Me Ju Ve Sa Ra Ke. Clicking "arms" a planet (filled `#A8742B`); already-placed planets show `#F1E6CF`. With a planet armed, clicking a house in the chart places it there; clicking the same house removes it. One house per planet.
  - **Create/Save button** — disabled (`#E5DCC8`) until Name is non-empty. Label "Create chart & open notes →" or "Save changes" in edit mode.

### 3. Chart workspace
- **Purpose:** Study a chart and write notes against it. The core screen.
- **Layout:** Sidebar + center chart column (min-width 452px) + right notes panel (392px). The center column horizontally scrolls if cramped; the notes panel is collapsible.
- **Components:**
  - **Header** — chart name (Spectral 27px 600), meta line (`date · place · Lahiri ayanāṁśa`), and a row of pills/buttons: "Lagna · <sign>", "<n> planets placed", **✎ Edit**, **⧉ Duplicate**, **🗑 Delete** (delete pill bordered `#E2C0AE`, text `#B0492B`).
  - **Divisional tabs** — D1 · Rāśi, D9 · Navāṁśa, D10 · Daśāṁśa, D12, D24, D30, D60. Active tab filled `#A8742B`. (In the prototype all show the D1 chart; production computes each varga.)
  - **Chart card** — `#FCFAF4` bg, holds the North Indian (diamond) chart as an inline SVG (see "North Indian chart" below).
  - **Planet legend** — grid of `repeat(auto-fit, minmax(150px, 1fr))` cards, each "<code> <Planet name>" + "<Sign> · House <n>".
  - **Notes panel** — header with a "›" collapse button + "Notes" title + **🎙 Dictate** button. One free-form `<textarea>` per chart (no per-house tabs). Dictate streams words into the textarea and shows a pulsing mic + "● listening…". Footer: save status dot ("Saved to Drive · <relative time>" green `#3FB27F`, or "Unsaved" amber `#C99A3F`) + **Save to Drive** button.
  - **Collapsed state** — when notes are collapsed, a 46px vertical rail labeled "‹ Notes" lets the user reopen; the chart column takes the freed width.

### 4. Learning library
- **Purpose:** Review findings collected across charts, grouped by topic.
- **Layout:** Sidebar + main scroll. Heading + intro, then a vertical list of cards (14px gap).
- **Components:** Each card (`#FBF7EF` bg, 1px `#E5DCC8`, 14px radius): topic title (Spectral 17px 600) + note-count pill, a body paragraph, and a row of tag chips (`#F3ECDD` bg, `#978B73` text). (Prototype content is illustrative; production aggregates real saved notes.)

### Global chrome
- **Top bar** (58px, `#FBF7EF`, bottom border `#E5DCC8`): ☰ sidebar toggle, astral-spark logo + "Astro Karma" wordmark (Spectral 18px 600), "● Connected to Google Drive" status (hidden on mobile), **⤓ Export .doc** (chart screen only), **＋ Add chart**.
- **Sidebar** (236px, `#FBF7EF`): WORKSPACE group (◈ Charts, ▤ Learning library, ✦ Glossary), divider, RECENT CHARTS list (clickable, active item highlighted `#F3ECDD`).

## Interactions & Behavior
- **Navigation:** screen state is one of `home | create | chart | library`. Sidebar nav and cards switch screens; opening a chart sets `activeId`.
- **Search:** live filter of the gallery by name / Lagna / place.
- **Planet placement:** arm-then-click model; toggling the same house removes the planet.
- **Generate:** fills `ascSign` + `houses` from birth details (mock now; ephemeris API later), flags `computed`, shows a toast.
- **Edit:** reopens the create screen pre-filled, title "Edit chart", button "Save changes"; saving writes back to the same chart id.
- **Duplicate:** clones a chart as "<name> (copy)" with notes copied, opens it.
- **Delete:** `window.confirm` guard, then removes and returns to home.
- **Dictation:** toggles a simulated speech-to-text stream into the active chart's notes (~230ms/word) with a pulsing mic indicator. In production, replace with the Web Speech API (`SpeechRecognition`) appending interim/final transcripts to the notes field.
- **Save to Drive:** stamps `savedAt` and shows a toast "Saved to Google Drive · /Astro Karma/charts". Production wires real Drive auth + upload.
- **Export .doc:** rasterizes the chart SVG to PNG via canvas, builds a Word-compatible HTML document (heading, meta, chart image, planet-positions table, notes), and downloads it as `<name>.doc` (`application/msword`). This works fully client-side and can be kept as-is.
- **Toasts:** transient bottom-center confirmations (auto-dismiss ~2.2s).
- **Animations:** `nk-pulse` (mic ring), `nk-toast` (toast slide/fade). Durations in the source.

## Responsive behavior
- Breakpoint at **860px** (`vw < 860` = mobile).
- Desktop is the priority: sidebar and notes panel are docked side panels, both collapsible.
- Below 860px: sidebar and notes become slide-over drawers with a dim backdrop; the top bar shows compact icon labels (＋, ⤓); a floating "🖉 Notes" button opens notes on the chart screen.

## State Management
State variables (from the prototype's `class Component`):
- `screen` — `'home' | 'create' | 'chart' | 'library'`
- `charts` — array of `{ id, name, date, place, ascSign (1–12), houses (12 arrays of planet codes), notes: { whole: string }, savedAt: number|null }`
- `activeId` — currently open chart id
- `varga` — selected divisional chart key (`'D1'…'D60'`)
- `dictating` — bool; `toast` — string|null
- `draft` — `{ name, date, place, ascSign, houses, computed }` for create/edit
- `editId` — id being edited (null = creating new)
- `placeTool` — armed planet code or null
- `menuId` — id of the card whose ⋯ menu is open
- `query` — search string
- `sidebarOpen`, `notesOpen` — panel visibility; `vw` — window width

Data-fetching requirements (production): geocode birth place → lat/long/timezone; ephemeris API for planet/ascendant longitudes → derive sign, house, nakṣatra, retrograde, divisional charts; Google Drive read/write; (optional) email delivery of the export.

## Backend work required (not in prototype)
A small backend/proxy unlocks the three simulated features (API keys can't live in client code, and these APIs block direct browser calls via CORS):
1. **Chart generation** — geocoding + ephemeris (hosted Vedic astrology API, or self-hosted Swiss Ephemeris).
2. **Google Drive** — OAuth + file save/fetch; suggested folder structure `/Astro Karma/charts`.
3. **Email export** (optional) — server-side mail send of the generated `.doc`/PDF.
The **Word export** and **manual placement** already work client-side and need no backend.

## North Indian chart (SVG geometry)
The chart is a square with both diagonals and a central diamond, making 12 house triangles. House 1 (ascendant) is the top-center diamond; houses proceed counter-clockwise. Sign numbers are derived from the Lagna: house *i* shows sign `((ascSign - 1 + i) % 12) + 1`. Planet codes are drawn centered in each house; the ascendant house is tinted `#F1E6CF` and labeled "ASC". Exact polygon points and house-center coordinates are in `Nakshatra.dc.html` (`POLY` and `CEN` arrays in the logic class) — reuse them directly.

## Design Tokens
**Colors**
- Page bg `#EBE4D6`; surface `#FBF7EF`; surface-2 `#F3ECDD`; chart fill `#FCFAF4`
- Ink `#2C2820`; sub-text `#978B73`; faint `#B2A079`
- Hairline/border `#E5DCC8`; dashed border `#D7C9AC`
- Accent `#A8742B`; accent-deep `#7A521C`; accent-soft `#F1E6CF`; on-accent `#FFFBF3`
- Planet text `#9A6A28`; chart stroke `#C9A957`
- Success/synced `#3FB27F`; unsaved/warn `#C99A3F`; danger `#B0492B` (border `#E2C0AE`)

**Typography**
- Headings: **Spectral** (serif), weights 400/500/600
- Body/UI: **Hanken Grotesk**, weights 400/500/600/700
- Sizes: page H1 28px; chart name 27px; section H2 19–23px; body 13.5–14px; meta 11.5–12.5px; labels 10.5–12px (uppercase, letter-spacing ~1.3px)

**Radius:** pills 20px; cards 14px; inputs/buttons 8–9px; menu 10px
**Shadows:** card `0 2px 10px rgba(0,0,0,.08)`; popover `0 8px 22px rgba(0,0,0,.16)`; drawer `±2px 0 18px rgba(0,0,0,.18)`; toast `0 8px 24px rgba(0,0,0,.18)`
**Layout:** sidebar 236px; notes panel 392px; chart column min 452px; mobile breakpoint 860px

## Assets
- **Fonts:** Spectral + Hanken Grotesk (Google Fonts).
- **Logo:** inline SVG astral spark (4-point star in a thin ring), accent `#A8742B`. Defined inline in the top bar markup.
- **Chart:** inline SVG, drawn programmatically (no image asset).
- No raster/image assets are required by the app itself.

## Files
- `Nakshatra.dc.html` — the full design source (template + logic). Primary reference.
- `Astro Karma.html` — self-contained, offline-runnable bundle of the same prototype (good for clicking through the real behavior).
- `screens/` — PNG snapshots of the four key screens for quick visual reference.

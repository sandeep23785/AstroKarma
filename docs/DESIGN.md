# Astro Karma — Design Spec

**Fidelity: high.** Colors, typography, spacing, layout, copy, and interactions are
intentional and must be recreated faithfully. The authority is the prototype in
`design/reference/` — `Nakshatra.dc.html` (template + logic) and `Astro Karma.html`
(runnable). This document captures the exact tokens and per-screen specs so the build
matches without reverse-engineering the source each time.

Screen snapshots: [`design/reference/screens/`](../design/reference/screens/) —
`01-home.png`, `02-add.png`, `03-workspace.png`, `04-library.png`.

---

## Design tokens

### Colors
| Token | Value | Use |
|---|---|---|
| page-bg | `#EBE4D6` | app background |
| surface | `#FBF7EF` | cards, panels, inputs, top bar, sidebar |
| surface-2 | `#F3ECDD` | pills, chips, hover, active nav |
| chart-fill | `#FCFAF4` | chart card / chart square fill |
| ink | `#2C2820` | primary text |
| sub-text | `#978B73` | secondary text |
| faint | `#B2A079` | placeholder glyphs, disabled text |
| hairline | `#E5DCC8` | borders / dividers |
| dashed-border | `#D7C9AC` | add-chart card dashed border |
| accent | `#A8742B` | primary buttons, active tabs, armed planet |
| accent-deep | `#7A521C` | accent text, monogram text |
| accent-soft | `#F1E6CF` | monogram bg, ascendant tint, computed badge |
| on-accent | `#FFFBF3` | text on accent |
| planet-text | `#9A6A28` | planet glyphs in chart / legend code |
| chart-stroke | `#C9A957` | chart lines/diagonals |
| success | `#3FB27F` | synced/saved dot |
| warn | `#C99A3F` | unsaved dot |
| danger | `#B0492B` | delete text |
| danger-border | `#E2C0AE` | delete pill border |

### Typography
- **Headings:** Spectral (serif) — weights 400/500/600.
- **Body / UI:** Hanken Grotesk — weights 400/500/600/700.
- Both via Google Fonts:
  `Spectral:ital,wght@0,400;0,500;0,600;1,400` + `Hanken+Grotesk:wght@400;500;600;700`.
- **Sizes:** page H1 28px; chart name 27px; create H1 26px; section H2 19–23px; card titles
  15–17px; body 13.5–14px; meta 11.5–12.5px; labels 10.5–12px (uppercase, letter-spacing
  ~1.3px).

### Radius / shadow / layout
- **Radius:** pills 20px; cards 14px; inputs/buttons 8–9px; menu/popover 10px; monogram 11px.
- **Shadows:** card `0 2px 10px rgba(0,0,0,.08)`; popover `0 8px 22px rgba(0,0,0,.16)`;
  drawer `±2px 0 18px rgba(0,0,0,.18)`; toast `0 8px 24px rgba(0,0,0,.18)`;
  FAB `0 6px 18px rgba(0,0,0,.2)`.
- **Layout:** sidebar 236px; notes panel 392px; chart column min 452px; chart card max
  452px; home content max 880px; create content max 980px (form max 620px); library content
  max 860px. **Mobile breakpoint: 860px** (`vw < 860`).

### Animations
- `nk-pulse` (mic ring): scale 1→2.2, opacity .5→0 over 1.6s ease-out infinite.
- `nk-toast`: slide-up + fade in/out over 2.2s (auto-dismiss).

---

## Global chrome

### Top bar (58px, `surface`, bottom border `hairline`)
`☰` sidebar toggle (34px, `surface-2` bg, `accent-deep`) · astral-spark logo SVG +
"Astro Karma" wordmark (Spectral 18px 600) · spacer · "● Connected to Google Drive" status
(success dot, hidden on mobile) · `⤓ Export .doc` (**chart screen only**, `surface-2`
button) · `＋ Add chart` (accent button). On mobile the last two collapse to `⤓` / `＋`.

> The astral-spark logo is an inline SVG: a 4-point star inside a thin ring, accent
> `#A8742B`. Markup is in `Nakshatra.dc.html` (top-bar block) — reuse it.

### Sidebar (236px, `surface`, right border `hairline`)
- **WORKSPACE** label (10.5px 700, uppercase, `sub-text`).
  - `◈ Charts` — active when screen ∈ {home, chart, create}.
  - `▤ Learning library` — active on library.
  - `✦ Glossary` — present but inert (cursor:default), `sub-text`.
- Divider (`hairline`).
- **RECENT CHARTS** label, then a clickable list of charts (`name` + `date · <Sign> Lagna`
  sub-line). Active item (open chart) highlighted `surface-2` with `hairline` border.
- Active nav item style: bg `accent-soft`, text `accent-deep`, weight 600.

### Toast
Bottom-center, `ink` bg, `surface` text, success dot, 11px 18px padding, radius 10px,
`nk-toast` animation, auto-dismiss ~2.2s.

---

## Screen 1 — Charts (home)

**Purpose:** browse/search the library; entry to open/add/edit/duplicate/delete.
**Layout:** sidebar + scroll area (padding 28px 30px), content max 880px. H1 "Charts"
(Spectral 28px 600) → search box → responsive card grid.

- **Search box** — max 380px; leading `⌕` glyph (`faint`); 10px radius, 1px `hairline`,
  `surface` bg; placeholder "Search by name, Lagna, or place…". Live filter (case-insensitive
  substring) over `name`, `<Sign> lagna`, `place`, `date`.
- **Grid** — `repeat(auto-fill, minmax(248px, 1fr))`, gap 14px.
- **Add-chart card** — dashed `dashed-border`, 14px radius, min-height 128px; `＋` tile
  (34px, `accent-soft`/`accent-deep`), "Add chart" (Spectral 17px 600), "Generate or place
  planets" sub. Opens Create.
- **Chart card** — `surface` bg, 1px `hairline`, 14px radius, min-height 128px, padding 18px:
  - 40px round monogram (`accent-soft` bg, `accent-deep` text, Spectral 18px 600, first
    letter of name).
  - Name (Spectral 15px 600) + sub `date · place` (12px `sub-text`).
  - Footer row: `<Sign> Lagna` pill (`surface-2` bg, `hairline` border, radius 14px) +
    `<n> placed` count.
  - Top-right `⋯` button (28px, `chart-fill` bg, `hairline`) → popover menu (radius 10px,
    popover shadow): **Open / Edit chart / Duplicate / Delete** (Delete in `danger`).
  - Whole card click opens the chart; menu/`⋯` clicks must `stopPropagation`.

---

## Screen 2 — Add chart / Edit chart

**Purpose:** create or edit a chart — auto-generate from birth details, or place by hand.
**Layout:** scroll area (padding 24px 26px), content max 980px. Back link "← Charts"
(`sub-text`), H1 "New chart" / "Edit chart" (Spectral 26px 600).

- **Form** — `repeat(auto-fit, minmax(240px, 1fr))`, gap 14px, max 620px. Fields, each with
  an uppercase label (12px 600 `sub-text`) and a 9px-radius `surface` input/select with
  `hairline` border:
  - **NAME** (text, e.g. "Aarav Sharma")
  - **LAGNA (ASCENDANT SIGN)** — select, 12 signs (Aries…Pisces, value 1–12)
  - **DATE OF BIRTH** (text, e.g. "14 Aug 1991")
  - **TIME & PLACE** (text, e.g. "04:32 · Pune, IN")
- **Generate panel** — bordered `surface` box (radius 12px, max 620px): title "Generate
  automatically" + "Compute planet positions from birth details via ephemeris API." +
  `✨ Generate` accent button. On success show a badge "✓ Computed via ephemeris (preview)
  — fine-tune manually below" (`accent-soft` bg, `accent-deep` text). *In production this
  calls `POST /api/generate`; the prototype uses a deterministic mock.*
- **Chart + palette** — `repeat(auto-fit, minmax(300px, 452px))`, gap 24px:
  - **Left:** chart card (`chart-fill`, radius 14px, padding 18px) with label
    "North Indian · D1 — `<placeHint>`" and the interactive SVG (1:1 aspect). `placeHint`
    is "pick a planet to place" or "placing `<Planet>` — click a house".
  - **Right:** label "OR PLACE MANUALLY — PICK A PLANET, CLICK A HOUSE"; the **planet
    palette** (9 buttons: Su Mo Ma Me Ju Ve Sa Ra Ke); helper text; then the **Save button**.
- **Planet palette** — armed planet = filled `accent`/`on-accent`; already-placed =
  `accent-soft`/`accent-deep`; idle = `surface`/`ink`; all 1px bordered, weight 600.
- **Placement model** — arm a planet, click a house to place; click that planet's house
  again to remove; one house per planet (placing moves it).
- **Save button** — disabled style (`hairline` bg, `faint` text, not-allowed) until NAME is
  non-empty; otherwise accent. Label "Create chart & open notes →" (new) / "Save changes"
  (edit). Edit pre-fills the form and writes back to the same id.

---

## Screen 3 — Chart workspace

**Purpose:** study a chart and write notes — the core screen.
**Layout:** sidebar + **center chart column** (min-width 452px, scrolls; horizontal scroll
if cramped on desktop) + **right notes panel** (392px, collapsible).

- **Header** — chart name (Spectral 27px 600) + meta line `date · place · Lahiri ayanāṁśa`
  (`sub-text`). Right cluster of pills/buttons (radius 20px, `surface`/`hairline`):
  `Lagna · <Sign>`, `<n> planets placed`, `✎ Edit`, `⧉ Duplicate`, `🗑 Delete` (delete
  bordered `danger-border`, text `danger`).
- **Divisional tabs** — `D1 · Rāśi`, `D9 · Navāṁśa`, `D10 · Daśāṁśa`, `D12`, `D24`, `D30`,
  `D60`. Active tab filled `accent`/`on-accent`; inactive `surface`/`sub-text`.
  **Scope now: only D1 and D9 are computed**; remaining tabs may be shown disabled or hidden
  until their varga math lands.
- **Chart card** — `chart-fill`, radius 14px, padding 18px, max 452px, centered; label
  "North Indian · `<vargaLabel>`"; the SVG chart (1:1).
- **Planet legend** — grid `repeat(auto-fit, minmax(150px, 1fr))`, gap 8px. Each card
  (`surface`, `hairline`, radius 10px): `<code>` (bold `planet-text`) + planet name, and a
  sub-line `<Sign> · House <n>`.
- **Notes panel** (`surface`, left border `hairline`):
  - Header: `›` collapse button + "Notes" (Spectral 19px 600) + `🎙 Dictate` button
    (accent pill; while dictating: `accent-deep` bg, label "Stop", pulsing ring + the
    preview text "● listening…").
  - Body: a single free-form `<textarea>` (transparent, Hanken 13.8px, line-height 1.62),
    placeholder "Write what you notice about this chart…". One note per chart.
  - Footer: save-status dot + label — "Saved to Drive · `<relative time>`" (success dot)
    or "Unsaved — not on Drive yet" (warn dot) — and a **Save to Drive** accent button.
    *(Maps to `PUT /api/charts/{id}/note`; the label/dot reflect DB save.)*
- **Collapsed state (desktop)** — when notes are closed, a 46px vertical rail labeled
  "‹ Notes" (vertical text) lets the user reopen; the chart column takes the freed width.
- **Dictation** — prototype simulates a speech-to-text stream (~230ms/word) into the note.
  Production: Web Speech API (`SpeechRecognition`) appending interim/final transcripts.

---

## Screen 4 — Learning library

**Purpose:** review findings collected across charts, grouped by topic.
**Layout:** scroll area (padding 28px 30px), content max 860px. H1 "Learning library"
(Spectral 28px 600) + intro "Findings you've saved across charts, grouped by what you were
studying." Then a vertical list (gap 14px) of cards.

- **Card** (`surface`, 1px `hairline`, radius 14px, padding 18px 20px): topic title
  (Spectral 17px 600) + note-count pill (`surface-2`/`hairline`); a body paragraph
  (13.5px, line-height 1.6); a row of tag chips (`surface-2` bg, `sub-text` text, radius
  6px, e.g. `#mars`, `#10th-house`).

> Prototype content here is illustrative. In production this screen **aggregates real saved
> data** — in Phase 5, the AI-generated `flashcards` (grouped/queried by planet/house/sign/
> tag). Until then it can summarize notes.

---

## Responsive behavior

- Breakpoint **860px** (`vw < 860` = mobile).
- **Desktop** is the priority: sidebar (236px) and notes panel (392px) are docked,
  collapsible side panels.
- **Mobile (<860px):**
  - Sidebar and notes become **slide-over drawers** (sidebar 256px from left; notes 88vw
    max 400px from right) with a dim backdrop (`rgba(20,16,10,.32)`) that closes them.
  - Top bar uses compact icon buttons (`＋`, `⤓`); "Connected to Google Drive" status hidden.
  - On the chart screen a floating **🖉 Notes** FAB (bottom-right, accent, FAB shadow) opens
    the notes drawer.
  - Opening a screen/chart on mobile auto-closes the sidebar; opening a chart also starts
    with notes closed.

---

## North-Indian chart (SVG)

A square (`viewBox 0 0 400 400`) with both diagonals and a central diamond → 12 house
triangles. House 1 (ascendant) = top-center diamond; houses proceed counter-clockwise. Each
house shows its **sign number** (`signOf(i, asc)`) above center and **planet codes** at
center; the ascendant house is tinted `accent-soft` and labeled "ASC". Exact polygon points
(`POLY`), house centers (`CEN`), colors, font sizes, and the interactive overlay are in
[CHART_GEOMETRY.md](CHART_GEOMETRY.md) — reuse them verbatim.

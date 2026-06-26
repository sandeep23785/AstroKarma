# North-Indian Chart — Geometry & Astro Math

Exact values and drawing logic for the North-Indian (diamond) chart, lifted from
`design/reference/Nakshatra.dc.html` (`class Component`). **Reuse verbatim** — these are
part of the fixed design. Coordinates are in a `0 0 400 400` viewBox.

---

## Constants

```ts
export const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

// planet code → full name
export const PMETA: Record<string,string> = {
  Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Ju:'Jupiter',
  Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu',
};

// canonical planet order (legend, export, palette)
export const PORDER = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];

// 12 house triangle polygons (house index 0 = ascendant / top-center diamond)
export const POLY = [
  '200,0 100,100 200,200 300,100', // 0  (H1 / ASC)
  '200,0 0,0 100,100',             // 1
  '0,0 0,200 100,100',             // 2
  '0,200 100,100 200,200 100,300', // 3
  '0,200 0,400 100,300',           // 4
  '0,400 200,400 100,300',         // 5
  '200,400 100,300 200,200 300,300', // 6
  '200,400 400,400 300,300',       // 7
  '400,400 400,200 300,300',       // 8
  '400,200 300,100 200,200 300,300', // 9
  '400,200 400,0 300,100',         // 10
  '400,0 200,0 300,100',           // 11
];

// house-center coordinates for text (sign number + planet codes)
export const CEN = [
  [200,100],[100,40],[40,100],[100,200],[40,300],[100,360],
  [200,300],[300,360],[360,300],[300,200],[360,100],[300,40],
];
```

## House → sign

House index `i` (0–11) for ascendant sign `asc` (1–12):

```ts
export const signOf = (i: number, asc: number) => ((asc - 1 + i) % 12) + 1;
```

---

## Drawing the chart (port of `chart()`)

Colors: stroke `T = #C9A957`, sub `SUB = #B2A079`, accent `ACC = #A8742B`,
planet `#9A6A28`, ascendant tint `#F1E6CF`, fill `#FCFAF4`.

1. **Square:** `rect x=2 y=2 w=396 h=396 rx=6 fill=#FCFAF4 stroke=T stroke-width=1.6`.
2. **Ascendant tint:** `polygon points=POLY[0] fill=#F1E6CF opacity=0.85`.
3. **Selected house (optional):** if `selected != null && != 0`,
   `polygon points=POLY[selected] fill=#A8742B opacity=0.16`.
4. **Diagonals:** two lines corner-to-corner, stroke `T` width 1.4
   (`2,2→398,398` and `398,2→2,398`).
5. **Central diamond:** `polygon points='200,2 398,200 200,398 2,200' fill=none stroke=T
   stroke-width=1.4`.
6. **Per house `i` (0–11):** at `CEN[i] = [cx, cy]`:
   - **Sign number** at `(cx, cy-11)`: `text-anchor=middle font-size=10 font-weight=600
     fill=SUB font-family='Hanken Grotesk'`, content `signOf(i, asc)`.
   - **Planets** (if any) at `(cx, cy+8)`: `font-size=13.5 font-weight=700
     fill=(i===0 ? ACC : #9A6A28) font-family='Hanken Grotesk' letter-spacing=0.4`,
     content `houses[i].join('  ')`.
   - **"ASC"** label only for `i===0` at `(cx, cy+24)`: `font-size=8 font-weight=700
     fill=ACC letter-spacing=1.5`.
   - All text `pointer-events:none`.
7. **Interactive overlay (create screen only):** if an `onHouse(i)` handler is given, add 12
   transparent `polygon points=POLY[i]` hit areas with `cursor:pointer` and `onClick`.

Render as `<svg viewBox='0 0 400 400' width='100%' height='100%' style='display:block'>`.

> **React component shape:** `<NorthIndianChart houses={string[][]} ascSign={number}
> onHouse?={(i:number)=>void} selected?={number|null} />`.

---

## Word-export SVG (port of `svgMarkup`)

For the `.doc` export, build a standalone SVG string sized `560x560` (same `0 0 400 400`
viewBox) — identical geometry but with `font-family='Arial'` (Word-safe) and no interactive
overlay. Rasterize to PNG on a canvas pre-filled `#FCFAF4`, then embed (~340px) in the Word
HTML. See `exportDoc()` / `svgToPng()` in the reference.

---

## Vargas (divisional charts)

> **Current build:** divisional charts are entered **manually**, per varga (D1–D60), and
> stored in `charts.vargas`. The automatic navāṁśa/varga math below is implemented in
> `app/astro/vargas.py` but **not used by the UI** right now (auto-generate is disabled).
> Keep it for when ephemeris generation is re-enabled.

The design exposes tabs D1, D9, D10, D12, D24, D30, D60. **Computed scope (dormant): D1 + D9.**

- **D1 (Rāśi):** the base chart — planets by their rāśi sign/house as above.
- **D9 (Navāṁśa):** computed from each planet's **sidereal longitude** (from `pyswisseph`),
  not from the D1 sign alone. Standard navāṁśa: each 30° sign is divided into 9 parts of
  3°20′; the navāṁśa sign is derived from the part index with the conventional starting sign
  per element (movable/fixed/dual). Compute server-side in `api/app/astro/vargas.py`,
  returning the same `{ascSign, houses}` shape the chart component consumes, so the SVG
  renders any varga unchanged.
- **Later vargas (D10/D12/D24/D30/D60):** add as further functions returning the same shape;
  the UI tabs are already present.

> The prototype renders D1 for every tab (placeholder). Real per-varga computation is
> backend work — see [SPEC.md](SPEC.md) §8.

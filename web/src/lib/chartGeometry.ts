// North-Indian chart geometry (viewBox 0 0 400 400) — see docs/CHART_GEOMETRY.md
// House index 0 = ascendant (top-center diamond); houses proceed counter-clockwise.

// 12 house triangle polygons (SVG points strings)
export const POLY: string[] = [
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
]

// house-center coordinates [x, y] for sign number + planet text
export const CEN: Array<[number, number]> = [
  [200, 100], [100, 40], [40, 100], [100, 200], [40, 300], [100, 360],
  [200, 300], [300, 360], [360, 300], [300, 200], [360, 100], [300, 40],
]

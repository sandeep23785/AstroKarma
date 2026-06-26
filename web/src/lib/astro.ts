// Astrology constants — see docs/CHART_GEOMETRY.md

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const

export type PlanetCode = 'Su' | 'Mo' | 'Ma' | 'Me' | 'Ju' | 'Ve' | 'Sa' | 'Ra' | 'Ke'

// planet code -> full name
export const PMETA: Record<PlanetCode, string> = {
  Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury', Ju: 'Jupiter',
  Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu',
}

// canonical planet order (legend, export, palette)
export const PORDER: PlanetCode[] = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke']

// house index i (0-11) for ascendant sign asc (1-12) -> sign number (1-12)
export const signOf = (i: number, asc: number): number => ((asc - 1 + i) % 12) + 1

// Divisional charts. D1 lives on the chart itself; D9+ are stored in `chart.vargas`.
export const VARGAS: Array<{ key: string; label: string }> = [
  { key: 'D1', label: 'D1 · Rāśi' },
  { key: 'D9', label: 'D9 · Navāṁśa' },
  { key: 'D10', label: 'D10 · Daśāṁśa' },
  { key: 'D12', label: 'D12' },
  { key: 'D24', label: 'D24' },
  { key: 'D30', label: 'D30' },
  { key: 'D60', label: 'D60' },
]

export const VARGA_LABEL: Record<string, string> = Object.fromEntries(
  VARGAS.map((v) => [v.key, v.label]),
)

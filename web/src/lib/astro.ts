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

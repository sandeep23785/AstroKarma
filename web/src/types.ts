import type { PlanetCode } from './lib/astro'

export interface Note {
  whole: string
}

export interface BodyPosition {
  code: string
  name: string
  lon: number
  sign: number
  house: number
  nakshatra: string
  pada: number
  retro: boolean
}

export interface ChartPositions {
  ascLon: number
  bodies: BodyPosition[]
}

// A manually-placed divisional chart (D9, D10, ...). D1 lives on the chart itself.
export interface VargaChart {
  ascSign: number
  houses: PlanetCode[][]
}

export interface Chart {
  id: string
  name: string
  date: string
  place: string
  ascSign: number // 1-12 (D1 Lagna)
  houses: PlanetCode[][] // 12 arrays of planet codes, indexed by house (0-11) — D1
  notes: Note
  savedAt: number | null
  positions?: ChartPositions | null // present when generated via ephemeris
  vargas?: Record<string, VargaChart> // manual D9/D10/... placements
}

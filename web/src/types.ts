import type { PlanetCode } from './lib/astro'

export interface Note {
  whole: string
}

export interface Chart {
  id: string
  name: string
  date: string
  place: string
  ascSign: number // 1-12
  houses: PlanetCode[][] // 12 arrays of planet codes, indexed by house (0-11)
  notes: Note
  savedAt: number | null
}

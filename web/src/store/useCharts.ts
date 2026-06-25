import { create } from 'zustand'
import type { Chart, ChartPositions } from '../types'
import type { PlanetCode } from '../lib/astro'
import { api } from '../lib/api'

export const emptyHouses = (): PlanetCode[][] => Array.from({ length: 12 }, () => [])

export interface Draft {
  name: string
  date: string
  place: string
  ascSign: number
  houses: PlanetCode[][]
  computed: boolean
  positions?: ChartPositions | null
}

interface ChartsState {
  charts: Chart[]
  loaded: boolean
  error: string | null
  load: () => Promise<void>
  getChart: (id: string | undefined) => Chart | undefined
  addChart: (d: Draft) => Promise<string>
  updateChart: (id: string, d: Draft) => Promise<void>
  duplicateChart: (id: string) => Promise<string | null>
  deleteChart: (id: string) => Promise<string | null> // returns next chart id (or null)
  setNote: (id: string, text: string) => void // optimistic, local-only until saveNote
  saveNote: (id: string) => Promise<void>
}

// The backend (Postgres/SQLite) is the source of truth; this store is the in-memory
// cache hydrated by load() and kept in sync by the mutating actions.
export const useCharts = create<ChartsState>((set, get) => ({
  charts: [],
  loaded: false,
  error: null,

  load: async () => {
    const charts = await api.get<Chart[]>('/api/charts')
    set({ charts, loaded: true, error: null })
  },

  getChart: (id) => get().charts.find((c) => c.id === id),

  addChart: async (d) => {
    const c = await api.post<Chart>('/api/charts', d)
    set((s) => ({ charts: [c, ...s.charts] }))
    return c.id
  },

  updateChart: async (id, d) => {
    const c = await api.put<Chart>(`/api/charts/${id}`, d)
    set((s) => ({ charts: s.charts.map((x) => (x.id === id ? c : x)) }))
  },

  duplicateChart: async (id) => {
    const c = await api.post<Chart>(`/api/charts/${id}/duplicate`)
    set((s) => ({ charts: [c, ...s.charts] }))
    return c.id
  },

  deleteChart: async (id) => {
    await api.del(`/api/charts/${id}`)
    const remaining = get().charts.filter((c) => c.id !== id)
    set({ charts: remaining })
    return remaining[0]?.id ?? null
  },

  setNote: (id, text) => {
    set((s) => ({
      charts: s.charts.map((c) => (c.id === id ? { ...c, notes: { whole: text } } : c)),
    }))
  },

  saveNote: async (id) => {
    const body = get().getChart(id)?.notes.whole ?? ''
    const c = await api.put<Chart>(`/api/charts/${id}/note`, { body })
    set((s) => ({ charts: s.charts.map((x) => (x.id === id ? c : x)) }))
  },
}))

export function relativeTime(ts: number | null): string | null {
  if (!ts) return null
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return Math.floor(d / 60000) + 'm ago'
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago'
  return Math.floor(d / 86400000) + 'd ago'
}

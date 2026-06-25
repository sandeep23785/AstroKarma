import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chart } from '../types'
import type { PlanetCode } from '../lib/astro'

export const emptyHouses = (): PlanetCode[][] => Array.from({ length: 12 }, () => [])

export interface Draft {
  name: string
  date: string
  place: string
  ascSign: number
  houses: PlanetCode[][]
  computed: boolean
}

// Seed charts ported from the prototype (design/reference/Nakshatra.dc.html).
function seedCharts(): Chart[] {
  return [
    {
      id: 'aarav',
      name: 'Aarav Sharma',
      date: '14 Aug 1991',
      place: '04:32 · Pune, IN',
      ascSign: 5,
      houses: [['Su', 'Me'], ['Ve'], [], ['Mo'], ['Ju'], ['Ra'], ['Sa'], [], [], ['Ma'], [], ['Ke']],
      notes: {
        whole:
          'Leo Lagna with Sun + Mercury in the 1st — strong sense of self, articulate, leadership wired into identity. Budha-Aditya yoga right on the ascendant.\n\nMars in the 10th (Taurus) — steady, immovable career drive; persistence over aggression.\nMoon in the 4th (Scorpio) — emotional depth, private inner world, needs solitude to recharge.\nSaturn in the 7th — delayed but durable partnerships; growth through relationship.\n\nWatch: Rahu in the 6th channels into work & service; can over-identify with problems to solve.',
      },
      savedAt: Date.now() - 120000,
    },
    {
      id: 'self',
      name: 'Self · natal',
      date: '02 Mar 1994',
      place: '09:10 · Jaipur, IN',
      ascSign: 1,
      houses: [[], [], ['Mo'], [], ['Su', 'Me'], [], ['Sa'], [], [], ['Ju'], ['Ma'], ['Ve', 'Ra']],
      notes: { whole: '' },
      savedAt: Date.now() - 86400000,
    },
    {
      id: 'gandhi',
      name: 'Practice · Gandhi',
      date: '02 Oct 1869',
      place: 'Porbandar, IN',
      ascSign: 7,
      houses: [[], ['Mo'], [], ['Ju'], [], [], ['Su', 'Ve', 'Ma', 'Me'], ['Ke'], [], [], [], ['Sa', 'Ra']],
      notes: { whole: '' },
      savedAt: Date.now() - 3 * 86400000,
    },
  ]
}

interface ChartsState {
  charts: Chart[]
  activeId: string | null
  getChart: (id: string | undefined) => Chart | undefined
  addChart: (d: Draft) => string
  updateChart: (id: string, d: Draft) => void
  duplicateChart: (id: string) => string | null
  deleteChart: (id: string) => string | null // returns next active id (or null)
  setNote: (id: string, text: string) => void
  saveNote: (id: string) => void
}

export const useCharts = create<ChartsState>()(
  persist(
    (set, get) => ({
      charts: seedCharts(),
      activeId: 'aarav',

      getChart: (id) => get().charts.find((c) => c.id === id),

      addChart: (d) => {
        const id = 'c' + Date.now()
        const chart: Chart = {
          id,
          name: d.name.trim(),
          date: d.date || '—',
          place: d.place || '',
          ascSign: Number(d.ascSign),
          houses: d.houses.map((a) => a.slice()),
          notes: { whole: '' },
          savedAt: null,
        }
        set((s) => ({ charts: [chart, ...s.charts], activeId: id }))
        return id
      },

      updateChart: (id, d) => {
        set((s) => ({
          charts: s.charts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: d.name.trim(),
                  date: d.date || '—',
                  place: d.place || '',
                  ascSign: Number(d.ascSign),
                  houses: d.houses.map((a) => a.slice()),
                }
              : c,
          ),
          activeId: id,
        }))
      },

      duplicateChart: (id) => {
        const c = get().charts.find((x) => x.id === id)
        if (!c) return null
        const nid = 'c' + Date.now()
        const copy: Chart = {
          ...c,
          id: nid,
          name: c.name + ' (copy)',
          houses: c.houses.map((a) => a.slice()),
          notes: { whole: c.notes.whole },
          savedAt: null,
        }
        set((s) => ({ charts: [copy, ...s.charts], activeId: nid }))
        return nid
      },

      deleteChart: (id) => {
        const remaining = get().charts.filter((c) => c.id !== id)
        const nextId = remaining[0]?.id ?? null
        set({ charts: remaining, activeId: nextId })
        return nextId
      },

      setNote: (id, text) => {
        set((s) => ({
          charts: s.charts.map((c) => (c.id === id ? { ...c, notes: { whole: text } } : c)),
        }))
      },

      saveNote: (id) => {
        set((s) => ({
          charts: s.charts.map((c) => (c.id === id ? { ...c, savedAt: Date.now() } : c)),
        }))
      },
    }),
    {
      name: 'astro-karma-charts',
      partialize: (s) => ({ charts: s.charts, activeId: s.activeId }),
    },
  ),
)

export function relativeTime(ts: number | null): string | null {
  if (!ts) return null
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return Math.floor(d / 60000) + 'm ago'
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago'
  return Math.floor(d / 86400000) + 'd ago'
}

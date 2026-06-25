import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCharts, emptyHouses, type Draft } from '../store/useCharts'
import { useToast } from '../store/useToast'
import { SIGNS, PMETA, PORDER, type PlanetCode } from '../lib/astro'
import { NorthIndianChart } from '../components/NorthIndianChart'
import { api } from '../lib/api'
import type { ChartPositions } from '../types'

interface GenerateResult {
  ascSign: number
  houses: PlanetCode[][]
  positions: ChartPositions
}

// Split the "TIME & PLACE" field (e.g. "04:32 · Pune, IN") into its parts.
function splitTimePlace(value: string): { time: string; place: string } {
  const parts = value.split('·')
  if (parts.length >= 2) {
    return { time: parts[0].trim(), place: parts.slice(1).join('·').trim() }
  }
  return { time: '', place: value.trim() }
}

const inputStyle: React.CSSProperties = {
  fontSize: 14,
  padding: '10px 12px',
  border: '1px solid var(--hairline)',
  borderRadius: 9,
  background: 'var(--surface)',
  color: 'var(--ink)',
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--sub-text)',
}

export function CreateScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = !!id
  const addChart = useCharts((s) => s.addChart)
  const updateChart = useCharts((s) => s.updateChart)
  const flash = useToast((s) => s.flash)

  const [draft, setDraft] = useState<Draft>(() => {
    if (id) {
      const c = useCharts.getState().getChart(id)
      if (c)
        return {
          name: c.name,
          date: c.date === '—' ? '' : c.date,
          place: c.place,
          ascSign: c.ascSign,
          houses: c.houses.map((a) => a.slice()),
          computed: false,
          positions: c.positions ?? null,
        }
    }
    return {
      name: '',
      date: '',
      place: '',
      ascSign: 1,
      houses: emptyHouses(),
      computed: false,
      positions: null,
    }
  })
  const [placeTool, setPlaceTool] = useState<PlanetCode | null>(null)
  const [generating, setGenerating] = useState(false)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const computeChart = async () => {
    if (!draft.date.trim()) {
      flash('Enter a date of birth to generate')
      return
    }
    const { time, place } = splitTimePlace(draft.place)
    if (!place) {
      flash('Enter a birth place (in "Time & place") to generate')
      return
    }
    setGenerating(true)
    try {
      const res = await api.post<GenerateResult>('/api/generate', {
        date: draft.date,
        time,
        place,
        tz: 'Asia/Kolkata',
      })
      patch({ ascSign: res.ascSign, houses: res.houses, computed: true, positions: res.positions })
      flash('Computed via Swiss Ephemeris (Lahiri)')
    } catch (e) {
      flash((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  // Manual placement invalidates the ephemeris longitudes, so clear positions
  // (D9+ will then fall back to the manually-placed D1 chart).
  const placeAt = (i: number) => {
    if (!placeTool) return
    setDraft((d) => {
      const wasThere = d.houses[i].includes(placeTool)
      const houses = d.houses.map((a) => a.filter((p) => p !== placeTool))
      if (!wasThere) houses[i] = [...houses[i], placeTool]
      return { ...d, houses, positions: null }
    })
  }

  const placed = new Set<string>(draft.houses.flat())
  const canSave = draft.name.trim() !== ''
  const placeHint = placeTool ? `placing ${PMETA[placeTool]} — click a house` : 'pick a planet to place'

  const save = async () => {
    if (!canSave) return
    try {
      if (editing && id) {
        await updateChart(id, draft)
        flash('Chart updated')
        navigate(`/chart/${id}`)
      } else {
        const newId = await addChart(draft)
        navigate(`/chart/${newId}`)
      }
    } catch {
      flash('Could not save — is the backend running?')
    }
  }

  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ maxWidth: 980 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--sub-text)' }}>
          ← Charts
        </Link>
        <h1 style={{ fontSize: 26, margin: '6px 0 18px' }}>{editing ? 'Edit chart' : 'New chart'}</h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 18,
            maxWidth: 620,
          }}
        >
          <label style={fieldLabelStyle}>
            NAME
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Aarav Sharma"
              style={inputStyle}
            />
          </label>
          <label style={fieldLabelStyle}>
            LAGNA (ASCENDANT SIGN)
            <select
              value={String(draft.ascSign)}
              onChange={(e) => patch({ ascSign: Number(e.target.value) })}
              style={inputStyle}
            >
              {SIGNS.map((s, i) => (
                <option key={s} value={String(i + 1)}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label style={fieldLabelStyle}>
            DATE OF BIRTH
            <input
              value={draft.date}
              onChange={(e) => patch({ date: e.target.value })}
              placeholder="14 Aug 1991"
              style={inputStyle}
            />
          </label>
          <label style={fieldLabelStyle}>
            TIME &amp; PLACE
            <input
              value={draft.place}
              onChange={(e) => patch({ place: e.target.value })}
              placeholder="04:32 · Pune, IN"
              style={inputStyle}
            />
          </label>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: '14px 16px',
            border: '1px solid var(--hairline)',
            borderRadius: 12,
            background: 'var(--surface)',
            maxWidth: 620,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Generate automatically</div>
              <div style={{ fontSize: 12, color: 'var(--sub-text)', marginTop: 1 }}>
                Compute planet positions from birth details via ephemeris API.
              </div>
            </div>
            <button
              onClick={computeChart}
              disabled={generating}
              style={{
                border: 'none',
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                fontSize: 13,
                fontWeight: 600,
                padding: '9px 15px',
                borderRadius: 9,
                cursor: generating ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: generating ? 0.7 : 1,
              }}
            >
              {generating ? '… Generating' : '✨ Generate'}
            </button>
          </div>
          {draft.computed && (
            <div
              style={{
                marginTop: 11,
                fontSize: 11.5,
                color: 'var(--accent-deep)',
                background: 'var(--accent-soft)',
                border: '1px solid var(--hairline)',
                padding: '6px 10px',
                borderRadius: 7,
                display: 'inline-block',
              }}
            >
              ✓ Computed via ephemeris (preview) — fine-tune manually below
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 452px))',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <div
            style={{
              background: 'var(--chart-fill)',
              border: '1px solid var(--hairline)',
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--sub-text)', marginBottom: 10 }}>
              North Indian · D1 — {placeHint}
            </div>
            <div style={{ aspectRatio: '1 / 1', width: '100%' }}>
              <NorthIndianChart houses={draft.houses} ascSign={Number(draft.ascSign)} onHouse={placeAt} />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.8px',
                color: 'var(--sub-text)',
                marginBottom: 9,
              }}
            >
              OR PLACE MANUALLY — PICK A PLANET, CLICK A HOUSE
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {PORDER.map((code) => {
                const isPlaced = placed.has(code)
                const armed = placeTool === code
                return (
                  <button
                    key={code}
                    onClick={() => setPlaceTool((t) => (t === code ? null : code))}
                    style={{
                      fontSize: 12.5,
                      padding: '7px 11px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: `1px solid ${armed ? 'var(--accent)' : 'var(--hairline)'}`,
                      background: armed ? 'var(--accent)' : isPlaced ? 'var(--accent-soft)' : 'var(--surface)',
                      color: armed ? 'var(--on-accent)' : isPlaced ? 'var(--accent-deep)' : 'var(--ink)',
                      fontWeight: 600,
                    }}
                  >
                    {code}
                    <span style={{ fontWeight: 500, opacity: 0.8 }}> {PMETA[code]}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--sub-text)', lineHeight: 1.55, marginBottom: 20 }}>
              Click an armed planet onto a house to place it. Click its house again to remove. Each planet sits in
              one house.
            </div>
            <button
              onClick={save}
              disabled={!canSave}
              style={{
                border: 'none',
                fontSize: 13.5,
                fontWeight: 600,
                padding: '11px 18px',
                borderRadius: 9,
                cursor: canSave ? 'pointer' : 'not-allowed',
                background: canSave ? 'var(--accent)' : 'var(--hairline)',
                color: canSave ? 'var(--on-accent)' : 'var(--faint)',
              }}
            >
              {editing ? 'Save changes' : 'Create chart & open notes →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

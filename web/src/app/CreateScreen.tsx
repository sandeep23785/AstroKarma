import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCharts, emptyHouses, type Draft } from '../store/useCharts'
import { useToast } from '../store/useToast'
import { SIGNS, PMETA, PORDER, VARGAS, VARGA_LABEL, type PlanetCode } from '../lib/astro'
import { NorthIndianChart } from '../components/NorthIndianChart'
import type { VargaChart } from '../types'

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

function cloneVargas(v: Record<string, VargaChart> | undefined): Record<string, VargaChart> {
  if (!v) return {}
  return Object.fromEntries(
    Object.entries(v).map(([k, val]) => [
      k,
      { ascSign: val.ascSign, houses: val.houses.map((a) => a.slice()) },
    ]),
  )
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
          vargas: cloneVargas(c.vargas),
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
      vargas: {},
    }
  })
  const [placeTool, setPlaceTool] = useState<PlanetCode | null>(null)
  const [editVarga, setEditVarga] = useState('D1')

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  // The chart currently being edited (D1 lives on the draft; others in draft.vargas).
  const cur: VargaChart =
    editVarga === 'D1'
      ? { ascSign: draft.ascSign, houses: draft.houses }
      : (draft.vargas[editVarga] ?? { ascSign: 1, houses: emptyHouses() })

  const setCur = (next: VargaChart) => {
    if (editVarga === 'D1') {
      patch({ ascSign: next.ascSign, houses: next.houses })
    } else {
      patch({ vargas: { ...draft.vargas, [editVarga]: next } })
    }
  }

  const placeAt = (i: number) => {
    if (!placeTool) return
    const wasThere = cur.houses[i].includes(placeTool)
    const houses = cur.houses.map((a) => a.filter((p) => p !== placeTool))
    if (!wasThere) houses[i] = [...houses[i], placeTool]
    setCur({ ascSign: cur.ascSign, houses })
  }

  const placed = new Set<string>(cur.houses.flat())
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

        {/* Choose which divisional chart to place planets in. */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.8px', color: 'var(--sub-text)', marginBottom: 9 }}>
          DIVISIONAL CHART TO EDIT
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
          {VARGAS.map((v) => {
            const active = v.key === editVarga
            const count =
              v.key === 'D1'
                ? draft.houses.flat().length
                : (draft.vargas[v.key]?.houses.flat().length ?? 0)
            return (
              <button
                key={v.key}
                onClick={() => setEditVarga(v.key)}
                style={{
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  padding: '7px 13px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color: active ? 'var(--on-accent)' : 'var(--sub-text)',
                }}
              >
                {v.label}
                {count > 0 && <span style={{ opacity: 0.75 }}> · {count}</span>}
              </button>
            )
          })}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 10,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--sub-text)' }}>
                North Indian · {VARGA_LABEL[editVarga]} — {placeHint}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--sub-text)' }}>
                Lagna
                <select
                  value={String(cur.ascSign)}
                  onChange={(e) => setCur({ ascSign: Number(e.target.value), houses: cur.houses })}
                  style={{ ...inputStyle, fontSize: 12.5, padding: '6px 8px' }}
                >
                  {SIGNS.map((s, i) => (
                    <option key={s} value={String(i + 1)}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ aspectRatio: '1 / 1', width: '100%' }}>
              <NorthIndianChart houses={cur.houses} ascSign={cur.ascSign} onHouse={placeAt} />
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
              PICK A PLANET, CLICK A HOUSE
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
              Editing the <b>{VARGA_LABEL[editVarga]}</b> chart. Click an armed planet onto a house to place it; click
              its house again to remove. Each divisional chart is placed independently.
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

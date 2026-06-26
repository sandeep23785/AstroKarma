import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCharts, relativeTime } from '../store/useCharts'
import { useToast } from '../store/useToast'
import { SIGNS, PMETA, PORDER, signOf, VARGAS, VARGA_LABEL } from '../lib/astro'
import { NorthIndianChart } from '../components/NorthIndianChart'

const pillStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 11px',
  borderRadius: 20,
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
}

export function ChartScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const chart = useCharts((s) => s.charts.find((c) => c.id === id))
  const setNote = useCharts((s) => s.setNote)
  const saveNote = useCharts((s) => s.saveNote)
  const duplicateChart = useCharts((s) => s.duplicateChart)
  const deleteChart = useCharts((s) => s.deleteChart)
  const flash = useToast((s) => s.flash)

  const [varga, setVarga] = useState('D1')
  const [notesOpen, setNotesOpen] = useState(true)
  const [dictating, setDictating] = useState(false)
  const dictateTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const stopDictate = () => {
    if (dictateTimer.current) {
      clearInterval(dictateTimer.current)
      dictateTimer.current = undefined
    }
  }
  // Stop any dictation when leaving the screen or switching charts.
  useEffect(() => {
    return stopDictate
  }, [id])

  if (!chart) {
    return (
      <div style={{ padding: '22px 26px' }}>
        <p style={{ color: 'var(--sub-text)' }}>Chart not found.</p>
      </div>
    )
  }

  const planetCount = chart.houses.reduce((a, h) => a + h.length, 0)
  const vargaLabel = VARGA_LABEL[varga] ?? 'D1 · Rāśi'

  // D1 lives on the chart; D9+ come from the manually-placed `vargas` (falling
  // back to the D1 layout until that divisional chart has been filled in).
  const view =
    varga === 'D1'
      ? { ascSign: chart.ascSign, houses: chart.houses as string[][] }
      : (chart.vargas?.[varga] ?? { ascSign: chart.ascSign, houses: chart.houses as string[][] })
  const legend: Array<{ code: string; name: string; pos: string }> = []
  PORDER.forEach((code) => {
    for (let i = 0; i < 12; i++) {
      if (view.houses[i]?.includes(code)) {
        legend.push({
          code,
          name: PMETA[code],
          pos: `${SIGNS[signOf(i, view.ascSign) - 1]} · House ${i + 1}`,
        })
      }
    }
  })

  const onDuplicate = async () => {
    try {
      const newId = await duplicateChart(chart.id)
      flash('Chart duplicated')
      if (newId) navigate(`/chart/${newId}`)
    } catch {
      flash('Could not duplicate chart')
    }
  }
  const onDelete = async () => {
    if (!window.confirm('Delete this chart? This cannot be undone.')) return
    try {
      const nextId = await deleteChart(chart.id)
      flash('Chart deleted')
      navigate(nextId ? `/chart/${nextId}` : '/')
    } catch {
      flash('Could not delete chart')
    }
  }

  // Simulated speech-to-text (replace with Web Speech API in production).
  const toggleDictate = () => {
    if (dictating) {
      stopDictate()
      setDictating(false)
      return
    }
    const words =
      'Jupiter in the fifth gives a genuine love of learning and a natural gift for teaching others.'.split(' ')
    let n = 0
    setDictating(true)
    dictateTimer.current = setInterval(() => {
      if (n >= words.length) {
        stopDictate()
        setDictating(false)
        return
      }
      const cur = useCharts.getState().getChart(chart.id)?.notes.whole ?? ''
      const w = words[n++]
      setNote(chart.id, (cur && !cur.endsWith('\n') ? cur + ' ' : cur) + w)
    }, 230)
  }

  const rel = relativeTime(chart.savedAt)
  const savedLabel = chart.savedAt ? `Saved to Drive · ${rel}` : 'Unsaved — not on Drive yet'
  const savedDot = chart.savedAt ? 'var(--success)' : 'var(--warn)'

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', position: 'relative', height: '100%' }}>
      <div
        style={{
          flex: 1,
          minWidth: 452,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          padding: '22px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 27, letterSpacing: '.2px' }}>{chart.name}</h1>
            <div style={{ marginTop: 5, fontSize: 13, color: 'var(--sub-text)' }}>
              {chart.date}
              {chart.place ? ` · ${chart.place}` : ''} · Lahiri ayanāṁśa
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span style={pillStyle}>
              Lagna · <b>{SIGNS[chart.ascSign - 1]}</b>
            </span>
            <span style={pillStyle}>{planetCount} planets placed</span>
            <button
              onClick={() => navigate(`/chart/${chart.id}/edit`)}
              style={{ ...pillStyle, fontWeight: 600, color: 'var(--accent-deep)', cursor: 'pointer' }}
            >
              ✎ Edit
            </button>
            <button
              onClick={onDuplicate}
              style={{ ...pillStyle, fontWeight: 600, color: 'var(--accent-deep)', cursor: 'pointer' }}
            >
              ⧉ Duplicate
            </button>
            <button
              onClick={onDelete}
              style={{
                ...pillStyle,
                fontWeight: 600,
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, margin: '18px 0 16px', flexWrap: 'wrap' }}>
          {VARGAS.map((v) => {
            const active = v.key === varga
            const hasData = v.key === 'D1' ? planetCount > 0 : !!chart.vargas?.[v.key]?.houses.flat().length
            return (
              <button
                key={v.key}
                onClick={() => setVarga(v.key)}
                style={{
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  padding: '7px 13px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--hairline)'}`,
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color: active ? 'var(--on-accent)' : hasData ? 'var(--accent-deep)' : 'var(--sub-text)',
                }}
              >
                {v.label}
              </button>
            )
          })}
        </div>

        <div
          style={{
            alignSelf: 'center',
            width: '100%',
            maxWidth: 452,
            background: 'var(--chart-fill)',
            border: '1px solid var(--hairline)',
            borderRadius: 14,
            padding: 18,
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--sub-text)' }}>
              North Indian · {vargaLabel}
            </span>
          </div>
          <div style={{ aspectRatio: '1 / 1', width: '100%' }}>
            <NorthIndianChart houses={view.houses} ascSign={view.ascSign} />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 8,
            marginTop: 18,
          }}
        >
          {legend.map((l, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
              }}
            >
              <b style={{ color: 'var(--planet-text)' }}>{l.code}</b>{' '}
              <span style={{ fontSize: 12.5 }}>{l.name}</span>
              <div style={{ fontSize: 11.5, color: 'var(--sub-text)', marginTop: 2 }}>{l.pos}</div>
            </div>
          ))}
        </div>
      </div>

      {notesOpen ? (
        <div
          style={{
            width: 'var(--notes-w)',
            flex: 'none',
            borderLeft: '1px solid var(--hairline)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setNotesOpen(false)}
                  title="Collapse notes"
                  style={{
                    width: 28,
                    height: 28,
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-2)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: 'var(--accent-deep)',
                    fontSize: 13,
                  }}
                >
                  ›
                </button>
                <h2 style={{ fontSize: 19 }}>Notes</h2>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {dictating && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: 0,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      animation: 'nk-pulse 1.6s ease-out infinite',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <button
                  onClick={toggleDictate}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    background: dictating ? 'var(--accent-deep)' : 'var(--accent)',
                    color: 'var(--on-accent)',
                  }}
                >
                  <span style={{ fontSize: 15 }}>🎙</span>
                  {dictating ? ' Stop' : ' Dictate'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '14px 18px' }}>
            <textarea
              value={chart.notes.whole}
              onChange={(e) => setNote(chart.id, e.target.value)}
              placeholder="Write what you notice about this chart…"
              style={{
                flex: 1,
                resize: 'none',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 13.8,
                lineHeight: 1.62,
                color: 'var(--ink)',
              }}
            />
            <div
              style={{ fontSize: 12, color: 'var(--sub-text)', fontStyle: 'italic', minHeight: 18 }}
            >
              {dictating ? '● listening…' : ''}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--hairline)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--sub-text)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: savedDot }} />
              {savedLabel}
            </span>
            <button
              onClick={async () => {
                try {
                  await saveNote(chart.id)
                  flash('Saved · /Astro Karma/charts')
                } catch {
                  flash('Could not save note')
                }
              }}
              style={{
                border: 'none',
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                fontSize: 12.5,
                fontWeight: 600,
                padding: '8px 15px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Save to Drive
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: 46,
            flex: 'none',
            borderLeft: '1px solid var(--hairline)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 16,
          }}
        >
          <button
            onClick={() => setNotesOpen(true)}
            title="Open notes"
            style={{
              border: '1px solid var(--hairline)',
              background: 'var(--surface-2)',
              color: 'var(--accent-deep)',
              fontSize: 12.5,
              fontWeight: 600,
              padding: '10px 7px',
              borderRadius: 8,
              cursor: 'pointer',
              writingMode: 'vertical-rl',
            }}
          >
            ‹ Notes
          </button>
        </div>
      )}
    </div>
  )
}

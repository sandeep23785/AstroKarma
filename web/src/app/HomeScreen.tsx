import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharts } from '../store/useCharts'
import { SIGNS } from '../lib/astro'
import { ChartCard } from '../components/ChartCard'

export function HomeScreen() {
  const navigate = useNavigate()
  const charts = useCharts((s) => s.charts)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = charts.filter(
    (c) =>
      !q ||
      [c.name, `${SIGNS[c.ascSign - 1]} lagna`, c.place, c.date].join(' ').toLowerCase().includes(q),
  )

  return (
    <div style={{ padding: '28px 30px' }}>
      <div style={{ maxWidth: 880 }}>
        <h1 style={{ fontSize: 28, margin: '0 0 14px' }}>Charts</h1>

        <div style={{ margin: '0 0 20px', maxWidth: 380, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--faint)',
              fontSize: 15,
              pointerEvents: 'none',
            }}
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, Lagna, or place…"
            style={{
              width: '100%',
              fontSize: 13.5,
              padding: '10px 12px 10px 34px',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              background: 'var(--surface)',
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
            gap: 14,
          }}
        >
          <div
            onClick={() => navigate('/chart/new')}
            style={{
              border: '1px dashed var(--dashed-border)',
              borderRadius: 14,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              cursor: 'pointer',
              background: 'rgba(251, 247, 239, 0.4)',
              minHeight: 128,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              ＋
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600 }}>Add chart</div>
            <div style={{ fontSize: 12.5, color: 'var(--sub-text)' }}>Generate or place planets</div>
          </div>

          {filtered.map((c) => (
            <ChartCard key={c.id} chart={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

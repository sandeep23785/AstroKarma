import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCharts } from '../store/useCharts'
import { SIGNS } from '../lib/astro'

const labelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '1.3px',
  color: 'var(--sub-text)',
  padding: '0 8px 8px',
}

function navItemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 11px',
    borderRadius: 9,
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    textAlign: 'left',
    cursor: 'pointer',
    background: active ? 'var(--accent-soft)' : 'transparent',
    color: active ? 'var(--accent-deep)' : 'var(--sub-text)',
  }
}

export function Sidebar() {
  const { pathname } = useLocation()
  const { id: activeRouteId } = useParams()
  const navigate = useNavigate()
  const charts = useCharts((s) => s.charts)

  const chartsActive = pathname === '/' || pathname.startsWith('/chart')
  const libraryActive = pathname.startsWith('/library')

  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        flex: 'none',
        borderRight: '1px solid var(--hairline)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
      }}
    >
      <div style={labelStyle}>WORKSPACE</div>
      <NavLink to="/" style={navItemStyle(chartsActive)}>
        ◈ Charts
      </NavLink>
      <NavLink to="/library" style={navItemStyle(libraryActive)}>
        ▤ Learning library
      </NavLink>
      <div style={{ ...navItemStyle(false), cursor: 'default' }}>✦ Glossary</div>

      <div style={{ height: 1, background: 'var(--hairline)', margin: '14px 6px' }} />

      <div style={labelStyle}>RECENT CHARTS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto' }}>
        {charts.map((c) => {
          const isActive = c.id === activeRouteId
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/chart/${c.id}`)}
              style={{
                padding: '9px 11px',
                borderRadius: 9,
                cursor: 'pointer',
                border: `1px solid ${isActive ? 'var(--hairline)' : 'transparent'}`,
                background: isActive ? 'var(--surface-2)' : 'transparent',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sub-text)', marginTop: 2 }}>
                {c.date} · {SIGNS[c.ascSign - 1]} Lagna
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ flex: 1 }} />
    </aside>
  )
}

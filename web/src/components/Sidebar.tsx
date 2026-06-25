import { NavLink, useLocation } from 'react-router-dom'

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
  // "Charts" is active on home, create, and chart workspace screens.
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
        {/* Populated from the chart library in Phase 1. */}
      </div>
      <div style={{ flex: 1 }} />
    </aside>
  )
}

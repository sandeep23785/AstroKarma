import { useNavigate, useMatch } from 'react-router-dom'

export function TopBar() {
  const navigate = useNavigate()
  const onChart = !!useMatch('/chart/:id')

  return (
    <header
      style={{
        height: 'var(--topbar-h)',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px 0 14px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--hairline)',
      }}
    >
      <button
        title="Menu"
        style={{
          width: 34,
          height: 34,
          flex: 'none',
          border: '1px solid var(--hairline)',
          background: 'var(--surface-2)',
          borderRadius: 9,
          cursor: 'pointer',
          fontSize: 15,
          color: 'var(--accent-deep)',
        }}
      >
        ☰
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="10.5" stroke="var(--accent)" strokeWidth="1.1" opacity="0.45" />
          <path
            d="M12 2.4 L13.7 10.3 L21.6 12 L13.7 13.7 L12 21.6 L10.3 13.7 L2.4 12 L10.3 10.3 Z"
            fill="var(--accent)"
          />
        </svg>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 600, letterSpacing: '.3px' }}>
          Astro Karma
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--sub-text)' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
        Connected to Google Drive
      </div>

      {onChart && (
        <button
          title="Export Word document"
          style={{
            border: '1px solid var(--hairline)',
            background: 'var(--surface-2)',
            color: 'var(--accent-deep)',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 13px',
            borderRadius: 9,
            cursor: 'pointer',
          }}
        >
          ⤓ Export .doc
        </button>
      )}

      <button
        onClick={() => navigate('/chart/new')}
        style={{
          border: 'none',
          background: 'var(--accent)',
          color: 'var(--on-accent)',
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 14px',
          borderRadius: 9,
          cursor: 'pointer',
        }}
      >
        ＋ Add chart
      </button>
    </header>
  )
}

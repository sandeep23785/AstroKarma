import { Link } from 'react-router-dom'

export function CreateScreen() {
  return (
    <div style={{ padding: '24px 26px' }}>
      <div style={{ maxWidth: 980 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--sub-text)' }}>
          ← Charts
        </Link>
        <h1 style={{ fontSize: 26, margin: '6px 0 18px' }}>New chart</h1>
        <p style={{ fontSize: 13.5, color: 'var(--sub-text)' }}>
          Birth-details form, generate panel, and the interactive chart + planet palette land here in Phase 1.
        </p>
      </div>
    </div>
  )
}

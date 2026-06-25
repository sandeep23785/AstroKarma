import { useToast } from '../store/useToast'

export function Toast() {
  const message = useToast((s) => s.message)
  if (!message) return null
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 26,
        background: 'var(--ink)',
        color: 'var(--surface)',
        fontSize: 13,
        fontWeight: 500,
        padding: '11px 18px',
        borderRadius: 10,
        boxShadow: 'var(--sh-toast)',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        animation: 'nk-toast 2.2s ease forwards',
        zIndex: 50,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
      {message}
    </div>
  )
}

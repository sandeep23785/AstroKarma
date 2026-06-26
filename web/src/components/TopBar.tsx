import { useEffect, useState } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
import { useCharts } from '../store/useCharts'
import { useToast } from '../store/useToast'
import { exportChartDoc } from '../lib/exportDoc'
import { drive, type DriveStatus } from '../lib/api'

export function TopBar() {
  const navigate = useNavigate()
  const match = useMatch('/chart/:id')
  const chartId = match?.params.id
  // Only the workspace (an existing chart) shows export — not /chart/new.
  const chart = useCharts((s) => (chartId ? s.charts.find((c) => c.id === chartId) : undefined))
  const flash = useToast((s) => s.flash)

  const [driveStatus, setDriveStatus] = useState<DriveStatus | null>(null)
  useEffect(() => {
    drive.status().then(setDriveStatus).catch(() => setDriveStatus(null))
  }, [])

  const connectDrive = async () => {
    if (!driveStatus?.configured) {
      flash('Google Drive is not set up yet (no credentials).')
      return
    }
    try {
      const { url } = await drive.authUrl()
      window.location.href = url
    } catch {
      flash('Could not start Google Drive connection')
    }
  }

  const driveConnected = !!driveStatus?.connected

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

      <button
        onClick={driveConnected ? undefined : connectDrive}
        title={driveConnected ? 'Google Drive connected' : 'Click to connect Google Drive'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 12.5,
          color: 'var(--sub-text)',
          background: 'transparent',
          border: 'none',
          cursor: driveConnected ? 'default' : 'pointer',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: driveConnected ? 'var(--success)' : 'var(--faint)',
          }}
        />
        {driveConnected ? 'Connected to Google Drive' : 'Connect Google Drive'}
      </button>

      {chart && (
        <button
          title="Export Word document"
          onClick={async () => {
            await exportChartDoc(chart)
            flash('Word document exported (.doc)')
          }}
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

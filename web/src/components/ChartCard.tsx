import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Chart } from '../types'
import { SIGNS } from '../lib/astro'
import { useCharts } from '../store/useCharts'
import { useToast } from '../store/useToast'

const menuBtnStyle: React.CSSProperties = {
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  fontSize: 13,
  padding: '8px 10px',
  borderRadius: 7,
  cursor: 'pointer',
  color: 'var(--ink)',
}

export function ChartCard({ chart }: { chart: Chart }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const duplicateChart = useCharts((s) => s.duplicateChart)
  const deleteChart = useCharts((s) => s.deleteChart)
  const flash = useToast((s) => s.flash)

  const planetCount = chart.houses.reduce((a, h) => a + h.length, 0)
  const initial = (chart.name.match(/[A-Za-z]/)?.[0] ?? '★').toUpperCase()

  const open = () => navigate(`/chart/${chart.id}`)

  const onDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    try {
      const id = await duplicateChart(chart.id)
      flash('Chart duplicated')
      if (id) navigate(`/chart/${id}`)
    } catch {
      flash('Could not duplicate chart')
    }
  }

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!window.confirm('Delete this chart? This cannot be undone.')) return
    try {
      await deleteChart(chart.id)
      flash('Chart deleted')
    } catch {
      flash('Could not delete chart')
    }
  }

  return (
    <div
      onClick={open}
      style={{
        position: 'relative',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        padding: 18,
        cursor: 'pointer',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 128,
      }}
    >
      <button
        title="Chart actions"
        onClick={(e) => {
          e.stopPropagation()
          setMenuOpen((v) => !v)
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          border: '1px solid var(--hairline)',
          background: 'var(--chart-fill)',
          borderRadius: 8,
          cursor: 'pointer',
          color: 'var(--sub-text)',
          fontSize: 16,
          lineHeight: 1,
          zIndex: 5,
        }}
      >
        ⋯
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 42,
            right: 10,
            zIndex: 12,
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 10,
            boxShadow: 'var(--sh-popover)',
            padding: 5,
            minWidth: 150,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button style={menuBtnStyle} onClick={open}>
            Open
          </button>
          <button
            style={menuBtnStyle}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(false)
              navigate(`/chart/${chart.id}/edit`)
            }}
          >
            Edit chart
          </button>
          <button style={menuBtnStyle} onClick={onDuplicate}>
            Duplicate
          </button>
          <button style={{ ...menuBtnStyle, color: 'var(--danger)' }} onClick={onDelete}>
            Delete
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: 'var(--accent-soft)',
            color: 'var(--accent-deep)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-head)',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font-head)' }}>{chart.name}</div>
          <div style={{ fontSize: 12, color: 'var(--sub-text)' }}>
            {chart.date}
            {chart.place ? ` · ${chart.place}` : ''}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--sub-text)',
        }}
      >
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 14,
            background: 'var(--surface-2)',
            border: '1px solid var(--hairline)',
          }}
        >
          {SIGNS[chart.ascSign - 1]} Lagna
        </span>
        <span>{planetCount} placed</span>
      </div>
    </div>
  )
}

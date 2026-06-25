import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { HomeScreen } from './app/HomeScreen'
import { CreateScreen } from './app/CreateScreen'
import { ChartScreen } from './app/ChartScreen'
import { LibraryScreen } from './app/LibraryScreen'
import { ensureAuth } from './lib/api'
import { useCharts } from './store/useCharts'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function CenterMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        color: 'var(--sub-text)',
        fontSize: 14,
      }}
    >
      <div style={{ maxWidth: 420 }}>{children}</div>
    </div>
  )
}

export function App() {
  const loaded = useCharts((s) => s.loaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // The backend may still be warming up when launched together; retry briefly.
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          await ensureAuth()
          await useCharts.getState().load()
          return
        } catch (e) {
          if (cancelled) return
          if (attempt === 5) setError((e as Error).message)
          else await sleep(800)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <CenterMessage>
        Can't reach the Astro Karma API. Make sure the backend is running on{' '}
        <code>localhost:8000</code>.
        <br />
        <span style={{ fontSize: 12 }}>({error})</span>
      </CenterMessage>
    )
  }

  if (!loaded) {
    return <CenterMessage>Loading your charts…</CenterMessage>
  }

  return (
    <div className="app">
      <TopBar />
      <div className="app__body">
        <Sidebar />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/chart/new" element={<CreateScreen />} />
            <Route path="/chart/:id/edit" element={<CreateScreen />} />
            <Route path="/chart/:id" element={<ChartScreen />} />
            <Route path="/library" element={<LibraryScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  )
}

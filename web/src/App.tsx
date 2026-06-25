import { Routes, Route, Navigate } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { HomeScreen } from './app/HomeScreen'
import { CreateScreen } from './app/CreateScreen'
import { ChartScreen } from './app/ChartScreen'
import { LibraryScreen } from './app/LibraryScreen'

export function App() {
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

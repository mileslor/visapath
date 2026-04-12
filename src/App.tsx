import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BnoPage from './pages/bno/BnoPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bno" element={<BnoPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BnoPage from './pages/bno/BnoPage'
import HmrcPage from './pages/hmrc/HmrcPage'
import SkilledWorkerPage from './pages/uk/SkilledWorkerPage'
import FamilyVisaPage from './pages/uk/FamilyVisaPage'
import CanadaCrsPage from './pages/canada/CanadaCrsPage'
import AustraliaPointsPage from './pages/australia/AustraliaPointsPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bno" element={<BnoPage />} />
          <Route path="/hmrc" element={<HmrcPage />} />
          <Route path="/skilled-worker" element={<SkilledWorkerPage />} />
          <Route path="/family-visa" element={<FamilyVisaPage />} />
          <Route path="/canada/crs" element={<CanadaCrsPage />} />
          <Route path="/australia/points" element={<AustraliaPointsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

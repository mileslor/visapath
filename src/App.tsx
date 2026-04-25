import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import BnoPage from './pages/bno/BnoPage'
import HmrcPage from './pages/hmrc/HmrcPage'
import SkilledWorkerPage from './pages/uk/SkilledWorkerPage'
import FamilyVisaPage from './pages/uk/FamilyVisaPage'
import StudentVisaPage from './pages/uk/StudentVisaPage'
import CanadaCrsPage from './pages/canada/CanadaCrsPage'
import CanadaStudentPage from './pages/canada/CanadaStudentPage'
import PnpPage from './pages/canada/PnpPage'
import AustraliaPointsPage from './pages/australia/AustraliaPointsPage'
import AuStudentPage from './pages/australia/AuStudentPage'
import Employer186Page from './pages/australia/Employer186Page'
import CriticalSkillsPage from './pages/ireland/CriticalSkillsPage'
import Stamp4Page from './pages/ireland/Stamp4Page'
import RnipPage from './pages/canada/RnipPage'

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
          <Route path="/uk/student" element={<StudentVisaPage />} />
          <Route path="/canada/crs" element={<CanadaCrsPage />} />
          <Route path="/canada/student" element={<CanadaStudentPage />} />
          <Route path="/canada/pnp" element={<PnpPage />} />
          <Route path="/australia/points" element={<AustraliaPointsPage />} />
          <Route path="/australia/student" element={<AuStudentPage />} />
          <Route path="/australia/186" element={<Employer186Page />} />
          <Route path="/ireland/critical-skills" element={<CriticalSkillsPage />} />
          <Route path="/ireland/stamp4" element={<Stamp4Page />} />
          <Route path="/canada/rnip" element={<RnipPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

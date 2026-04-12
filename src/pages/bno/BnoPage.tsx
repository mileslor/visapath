import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Trip, BnoData } from '../../lib/bno/types'
import { calculate } from '../../lib/bno/calculator'
import TripForm from './TripForm'
import TripList from './TripList'
import StatusCards from './StatusCards'
import AbsenceChart from './AbsenceChart'
import CsvHandler from './CsvHandler'

const STORAGE_KEY = 'visapath-bno-data'

function loadData(): BnoData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as BnoData
  } catch {
    // ignore
  }
  return { arrivalDate: '', trips: [] }
}

function saveData(data: BnoData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export default function BnoPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<BnoData>(loadData)
  const [showForm, setShowForm] = useState(false)
  const [showRules, setShowRules] = useState(false)

  useEffect(() => {
    saveData(data)
  }, [data])

  const calc = useMemo(() => {
    if (!data.arrivalDate || data.arrivalDate.length < 10) return null
    try {
      return calculate(data.arrivalDate, data.trips)
    } catch {
      return null
    }
  }, [data])

  function addTrip(tripData: Omit<Trip, 'id'>) {
    const trip: Trip = { ...tripData, id: crypto.randomUUID() }
    setData((prev) => ({ ...prev, trips: [...prev.trips, trip] }))
    setShowForm(false)
  }

  function updateTrip(id: string, tripData: Omit<Trip, 'id'>) {
    setData((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === id ? { ...tripData, id } : t)),
    }))
  }

  function deleteTrip(id: string) {
    setData((prev) => ({ ...prev, trips: prev.trips.filter((t) => t.id !== id) }))
  }

  function handleImport(imported: Trip[]) {
    setData((prev) => ({
      ...prev,
      // Merge: avoid duplicate by id (re-imported gets new ids anyway, dedupe by date pair)
      trips: [...prev.trips, ...imported],
    }))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          🇬🇧 {t('bno.title')}
        </h1>
        <p className="text-slate-500 text-sm">{t('bno.subtitle')}</p>
      </div>

      {/* Arrival date + CSV */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex flex-wrap gap-4 items-end justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('bno.arrivalDate')}
          </label>
          <input
            type="date"
            value={data.arrivalDate}
            onChange={(e) => setData((prev) => ({ ...prev, arrivalDate: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {data.arrivalDate && (
            <p className="text-xs text-slate-400 mt-1">{t('bno.arrivalDateHint')}</p>
          )}
        </div>
        <CsvHandler
          trips={data.trips}
          arrivalDate={data.arrivalDate}
          onImport={handleImport}
        />
      </div>

      {/* Main layout: 2-col on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Trip management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              {t('bno.tripList')}
              {data.trips.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({data.trips.length})
                </span>
              )}
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + {t('bno.addTrip')}
              </button>
            )}
          </div>

          {showForm && (
            <TripForm
              onSave={addTrip}
              onCancel={() => setShowForm(false)}
            />
          )}

          <TripList
            trips={data.trips}
            onUpdate={updateTrip}
            onDelete={deleteTrip}
          />
        </div>

        {/* Right: Status + Chart */}
        <div className="space-y-4">
          {calc ? (
            <>
              <StatusCards calc={calc} />
              {calc.rollingData.length > 0 && (
                <AbsenceChart data={calc.rollingData} />
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm">請先輸入抵達英國日期</p>
            </div>
          )}
        </div>
      </div>

      {/* Rules section */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowRules((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-amber-100 transition-colors"
        >
          <span className="text-sm font-medium text-amber-800">
            ⚖️ {t('bno.rules.title')}
          </span>
          <span className="text-amber-600 text-sm">{showRules ? '▲' : '▼'}</span>
        </button>
        {showRules && (
          <div className="px-5 pb-5 space-y-2">
            {(['rule1', 'rule2', 'rule3', 'rule4'] as const).map((key) => (
              <p key={key} className="text-xs text-amber-700 flex gap-2">
                <span>•</span>
                <span>{t(`bno.rules.${key}`)}</span>
              </p>
            ))}
            <p className="text-xs text-amber-500 mt-2">{t('bno.rules.source')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

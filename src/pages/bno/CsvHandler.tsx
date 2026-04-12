import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Papa from 'papaparse'
import type { Trip } from '../../lib/bno/types'

interface Props {
  trips: Trip[]
  arrivalDate: string
  onImport: (trips: Trip[]) => void
}

interface CsvRow {
  departure_date?: string
  return_date?: string
  destination?: string
  notes?: string
}

export default function CsvHandler({ trips, arrivalDate, onImport }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const rows = trips.map((trip) => ({
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      destination: trip.destination ?? '',
      notes: trip.notes ?? '',
    }))

    // Add metadata row as comment-like first row
    const meta = [{ departure_date: '# VisaPath BNO Export', return_date: `arrival=${arrivalDate}`, destination: '', notes: '' }]
    const csv = Papa.unparse([...meta, ...rows])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `visapath-bno-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const imported: Trip[] = []
        for (const row of results.data) {
          // Skip metadata rows
          if (!row.departure_date || row.departure_date.startsWith('#')) continue
          if (!row.return_date) continue

          const dep = row.departure_date.trim()
          const ret = row.return_date.trim()

          // Basic date validation
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dep) || !/^\d{4}-\d{2}-\d{2}$/.test(ret)) continue
          if (ret <= dep) continue

          imported.push({
            id: crypto.randomUUID(),
            departureDate: dep,
            returnDate: ret,
            destination: row.destination?.trim() || undefined,
            notes: row.notes?.trim() || undefined,
          })
        }

        if (imported.length === 0) {
          alert(t('bno.csv.importError'))
        } else {
          onImport(imported)
          alert(t('bno.csv.importSuccess').replace('{n}', String(imported.length)))
        }
      },
      error() {
        alert(t('bno.csv.importError'))
      },
    })

    // Reset file input
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
      >
        📥 {t('bno.csv.import')}
      </button>
      <button
        onClick={handleExport}
        disabled={trips.length === 0}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        📤 {t('bno.csv.export')}
      </button>
    </div>
  )
}

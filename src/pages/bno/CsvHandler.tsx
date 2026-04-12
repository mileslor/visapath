import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Papa from 'papaparse'
import type { Trip, ProfileStore } from '../../lib/bno/types'

interface BackupFile {
  type: 'visapath-backup'
  version: number
  exportedAt: string
  store: ProfileStore
}

interface Props {
  trips: Trip[]
  arrivalDate: string
  profileName: string
  store: ProfileStore
  onImport: (trips: Trip[]) => void        // replace current member's trips
  onRestoreAll: (store: ProfileStore) => void  // replace entire store
}

interface CsvRow {
  departure_date?: string
  return_date?: string
  destination?: string
  notes?: string
}

export default function CsvHandler({ trips, arrivalDate, profileName, store, onImport, onRestoreAll }: Props) {
  const { t } = useTranslation()
  const csvFileRef = useRef<HTMLInputElement>(null)
  const jsonFileRef = useRef<HTMLInputElement>(null)

  // === Individual member CSV ===
  function handleExportCsv() {
    const rows = trips.map(trip => ({
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      destination: trip.destination ?? '',
      notes: trip.notes ?? '',
    }))
    const meta = [{ departure_date: '# VisaPath BNO Export', return_date: `arrival=${arrivalDate}`, destination: '', notes: '' }]
    const csv = Papa.unparse([...meta, ...rows])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = profileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-')
    link.download = `visapath-${safeName}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const imported: Trip[] = []
        for (const row of results.data) {
          if (!row.departure_date || row.departure_date.startsWith('#')) continue
          if (!row.return_date) continue
          const dep = row.departure_date.trim()
          const ret = row.return_date.trim()
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
          const ok = trips.length > 0
            ? window.confirm(t('bno.csv.importWarning', { n: trips.length }) + '\n\n⚠️ ' + t('profile.backupReminder'))
            : true
          if (ok) {
            onImport(imported)
            alert(t('bno.csv.importSuccess').replace('{n}', String(imported.length)))
          }
        }
      },
      error() { alert(t('bno.csv.importError')) },
    })
    e.target.value = ''
  }

  // === Full backup JSON (all members) ===
  function handleExportJson() {
    const profileCount = Object.keys(store.profiles).length
    const backup: BackupFile = {
      type: 'visapath-backup',
      version: 1,
      exportedAt: new Date().toISOString().split('T')[0],
      store,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `visapath-backup-${profileCount}members-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const backup = JSON.parse(raw) as BackupFile
        if (backup.type !== 'visapath-backup' || !backup.store?.profiles || !backup.store?.activeId) {
          alert(t('bno.csv.importError'))
          return
        }
        const profileCount = Object.keys(store.profiles).length
        const restoreCount = Object.keys(backup.store.profiles).length
        const ok = window.confirm(
          t('bno.csv.restoreAllWarning', { current: profileCount, restore: restoreCount }) +
          '\n\n⚠️ ' + t('profile.backupReminder')
        )
        if (ok) {
          onRestoreAll(backup.store)
          alert(t('bno.csv.restoreAllSuccess', { n: restoreCount }))
        }
      } catch {
        alert(t('bno.csv.importError'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const memberCount = Object.keys(store.profiles).length

  return (
    <div className="space-y-2">
      {/* Individual member row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 w-16 shrink-0">{t('bno.csv.labelSingle')}</span>
        <input ref={csvFileRef} type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
        <button
          onClick={() => csvFileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          📥 {t('bno.csv.import')}
        </button>
        <button
          onClick={handleExportCsv}
          disabled={trips.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          📤 {t('bno.csv.export')}
        </button>
      </div>

      {/* All members row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 w-16 shrink-0">{t('bno.csv.labelAll', { n: memberCount })}</span>
        <input ref={jsonFileRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
        <button
          onClick={() => jsonFileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          📂 {t('bno.csv.restoreAll')}
        </button>
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          💾 {t('bno.csv.backupAll')}
        </button>
      </div>
    </div>
  )
}

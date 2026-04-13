import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Papa from 'papaparse'
import type { Trip, BnoData, ProfileStore } from '../../lib/bno/types'

interface BackupFile {
  type: 'visapath-backup'
  version: number
  exportedAt: string
  store: ProfileStore
}

interface Props {
  trips: Trip[]
  approvalDate: string
  arrivalDate: string
  profileName: string
  store: ProfileStore
  onImportAsNew: (data: BnoData, name: string) => void  // add as new member
  onRestoreAll: (store: ProfileStore) => void            // replace entire store
}

interface CsvRow {
  departure_date?: string
  return_date?: string
  destination?: string
  notes?: string
}

export default function CsvHandler({ trips, approvalDate, arrivalDate, profileName, store, onImportAsNew, onRestoreAll }: Props) {
  const { t } = useTranslation()
  const csvFileRef = useRef<HTMLInputElement>(null)
  const jsonFileRef = useRef<HTMLInputElement>(null)

  // === CSV export (current member) ===
  function handleExportCsv() {
    const rows = trips.map(trip => ({
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      destination: trip.destination ?? '',
      notes: trip.notes ?? '',
    }))
    const meta = [{ departure_date: '# VisaPath BNO Export', return_date: `approval=${approvalDate}|arrival=${arrivalDate}`, destination: '', notes: '' }]
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

  // === CSV import → add as new member ===
  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const imported: Trip[] = []
        let importedApproval = ''
        let importedArrival = ''

        for (const row of results.data) {
          if (!row.departure_date) continue
          // Parse metadata row
          if (row.departure_date.startsWith('#')) {
            const meta = row.return_date ?? ''
            const approvalMatch = meta.match(/approval=(\d{4}-\d{2}-\d{2})/)
            const arrivalMatch = meta.match(/arrival=(\d{4}-\d{2}-\d{2})/)
            if (approvalMatch) importedApproval = approvalMatch[1]
            if (arrivalMatch) importedArrival = arrivalMatch[1]
            continue
          }
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
          const defaultName = file.name.replace(/\.csv$/i, '').replace(/^visapath-/, '').replace(/-\d{4}-\d{2}-\d{2}$/, '') || t('bno.csv.shareDefaultName')
          const name = window.prompt(t('profile.newNamePrompt'), defaultName)
          if (name?.trim()) {
            onImportAsNew({ approvalDate: importedApproval, arrivalDate: importedArrival, trips: imported }, name.trim())
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

  return (
    <div className="space-y-2">
      {/* CSV row — main sharing tools */}
      <div className="flex items-center gap-2 flex-wrap">
        <input ref={csvFileRef} type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
        <button
          onClick={handleExportCsv}
          disabled={trips.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          📤 {t('bno.csv.export')}
        </button>
        <button
          onClick={() => csvFileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          📥 {t('bno.csv.import')}
        </button>
      </div>

      {/* JSON full backup — less prominent */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
        <span className="text-xs text-slate-400 shrink-0">{t('bno.csv.fullBackup')}:</span>
        <input ref={jsonFileRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          💾 {t('bno.csv.backupAll')}
        </button>
        <button
          onClick={() => jsonFileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          📂 {t('bno.csv.restoreAll')}
        </button>
      </div>
    </div>
  )
}

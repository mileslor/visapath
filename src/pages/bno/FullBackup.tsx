import { useRef } from 'react'
import type { TFunction } from 'i18next'
import type { ProfileStore } from '../../lib/bno/types'

interface BackupFile {
  type: 'visapath-backup'
  version: number
  exportedAt: string
  store: ProfileStore
}

interface Props {
  store: ProfileStore
  onRestoreAll: (store: ProfileStore) => void
  t: TFunction
}

export default function FullBackup({ store, onRestoreAll, t }: Props) {
  const jsonFileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
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

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string) as BackupFile
        if (backup.type !== 'visapath-backup' || !backup.store?.profiles || !backup.store?.activeId) {
          alert(t('bno.csv.importError'))
          return
        }
        const ok = window.confirm(
          t('bno.csv.restoreAllWarning', {
            current: Object.keys(store.profiles).length,
            restore: Object.keys(backup.store.profiles).length,
          }) + '\n\n⚠️ ' + t('profile.backupReminder')
        )
        if (ok) {
          onRestoreAll(backup.store)
          alert(t('bno.csv.restoreAllSuccess', { n: Object.keys(backup.store.profiles).length }))
        }
      } catch {
        alert(t('bno.csv.importError'))
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="mt-10 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400 mr-1">💾 {t('bno.csv.fullBackup')}:</span>
      <input ref={jsonFileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      <button
        onClick={handleExport}
        className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        {t('bno.csv.backupAll')}
      </button>
      <button
        onClick={() => jsonFileRef.current?.click()}
        className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        {t('bno.csv.restoreAll')}
      </button>
    </div>
  )
}

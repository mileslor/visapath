import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProfileStore } from '../../lib/bno/types'

interface Props {
  store: ProfileStore
  onSwitch: (id: string) => void
  onAdd: (name: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  csvSlot?: ReactNode
}

export default function ProfileSwitcher({ store, onSwitch, onAdd, onDelete, onRename, onDuplicate, csvSlot }: Props) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const profiles = Object.values(store.profiles)
  const active = store.profiles[store.activeId]

  function handleAdd() {
    const idx = profiles.length + 1
    const defaultName = `成員 ${String.fromCharCode(64 + idx)}`
    const name = window.prompt(t('profile.newNamePrompt'), defaultName)
    if (name?.trim()) onAdd(name.trim())
  }

  function handleRename() {
    if (!active) return
    const name = window.prompt(t('profile.renamePrompt'), active.name)
    if (name?.trim()) onRename(active.id, name.trim())
  }

  function handleDelete() {
    if (!active) return
    const ok = window.confirm(
      t('profile.deleteConfirm', { name: active.name }) + '\n\n⚠️ ' + t('profile.backupReminder')
    )
    if (ok) onDelete(active.id)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
      {/* Member tabs row + toggle arrow */}
      <div className="flex items-center gap-2 flex-wrap">
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => onSwitch(p.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p.id === store.activeId
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            👤 {p.name}
          </button>
        ))}
        <button
          onClick={() => setExpanded(v => !v)}
          className="ml-auto px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title={expanded ? t('profile.collapse') : t('profile.expand')}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expandable controls */}
      {expanded && (
        <>
          {/* Add member */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-500 border border-dashed border-slate-300 hover:bg-slate-50 transition-colors"
            >
              + {t('profile.add')}
            </button>

            {/* Active profile actions */}
            {active && (
              <>
                <button
                  onClick={handleRename}
                  className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ✏️ {t('profile.rename')}
                </button>
                <button
                  onClick={() => onDuplicate(active.id)}
                  title={t('profile.duplicateHint')}
                  className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  📋 {t('profile.duplicate')}
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={handleDelete}
                    className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    🗑️ {t('profile.delete')}
                  </button>
                )}
              </>
            )}
          </div>

          {/* CSV import/export */}
          {csvSlot && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              {csvSlot}
            </div>
          )}

          {/* Backup warning */}
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3 leading-relaxed">
            ⚠️ {t('profile.backupWarning')}
          </p>
        </>
      )}
    </div>
  )
}

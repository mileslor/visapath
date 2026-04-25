import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface CheckItem {
  key: string
}

// ILR items shared by all UK long-stay visa types
const COMMON_ILR_ITEMS: CheckItem[] = [
  { key: 'passport' },
  { key: 'brp' },
  { key: 'photos' },
  { key: 'travelHistory' },
  { key: 'b1English' },
  { key: 'lifeInUk' },
  { key: 'proofAddress' },
  { key: 'proofEmployment' },
  { key: 'taxReturn' },
  { key: 'fee' },
  { key: 'form' },
]

const COMMON_CITIZENSHIP_ITEMS: CheckItem[] = [
  { key: 'passport' },
  { key: 'ilrDoc' },
  { key: 'photos' },
  { key: 'proofAddress' },
  { key: 'absenceHistory' },
  { key: 'goodCharacter' },
  { key: 'lifeInUk' },
  { key: 'englishProof' },
  { key: 'fee' },
  { key: 'form' },
]

// i18n namespace per visa type (falls back to bno for shared items)
type VisaChecklistType = 'bno' | 'skilled_worker' | 'family'

const ILR_NS: Record<VisaChecklistType, string> = {
  bno: 'bno',
  skilled_worker: 'sw',
  family: 'familyVisa',
}

interface Props {
  storageKey?: string
  visaType?: VisaChecklistType
}

export default function Checklist({ storageKey = 'visapath_checklist', visaType = 'bno' }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<'ilr' | 'citizenship'>('ilr')
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}') } catch { return {} }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked))
  }, [checked, storageKey])

  const ns = ILR_NS[visaType]

  const items = stage === 'ilr' ? COMMON_ILR_ITEMS : COMMON_CITIZENSHIP_ITEMS
  const doneCount = items.filter(i => checked[`${stage}_${i.key}`]).length

  function toggle(key: string) {
    const id = `${stage}_${key}`
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function resetStage() {
    const newChecked = { ...checked }
    items.forEach(i => delete newChecked[`${stage}_${i.key}`])
    setChecked(newChecked)
  }

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">✅ {t('bno.checklist.title')}</span>
          {open && (
            <span className="text-xs text-slate-400">
              {doneCount} / {items.length}
            </span>
          )}
        </div>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5">
          {/* Stage tabs */}
          <div className="flex gap-2 mt-4 mb-4">
            {(['ilr', 'citizenship'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stage === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(`bno.checklist.stage.${s}`)}
              </button>
            ))}
            <button
              onClick={resetStage}
              className="ml-auto px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              {t('bno.checklist.reset')}
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.map(item => {
              const id = `${stage}_${item.key}`
              const done = !!checked[id]
              return (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer group py-1">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggle(item.key)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-400 cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <span className={`text-sm select-none ${done ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {t(`${ns}.checklist.${stage}.${item.key}`)}
                    </span>
                    {t(`${ns}.checklist.${stage}.${item.key}Hint`, { defaultValue: '' }) && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t(`${ns}.checklist.${stage}.${item.key}Hint`, { defaultValue: '' })}
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {doneCount === items.length && items.length > 0 && (
            <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium text-center">
              🎉 {t('bno.checklist.allDone')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

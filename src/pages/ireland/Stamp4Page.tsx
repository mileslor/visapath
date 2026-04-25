import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-ie-stamp4'

type CurrentStatus =
  | 'criticalSkills'   // Critical Skills EP → 2 years
  | 'generalPermit'    // General Work Permit → 5 years
  | 'spouseCritical'   // Spouse/partner of CSEP → immediate
  | 'stamp1g'          // Graduate Stamp 1G → 2 years working
  | 'other'

interface Stamp4State {
  status: CurrentStatus
  startDate: string
  checks: Record<string, boolean>
}

const EMPTY: Stamp4State = { status: 'criticalSkills', startDate: '', checks: {} }
const DEMO: Stamp4State = {
  status: 'criticalSkills',
  startDate: '2023-06-01',
  checks: { continuous: true, goodStanding: true },
}

const YEARS_NEEDED: Record<CurrentStatus, number | null> = {
  criticalSkills: 2,
  generalPermit: 5,
  spouseCritical: 0,
  stamp1g: 2,
  other: null,
}

function loadState(): Stamp4State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return EMPTY
}

function CheckRow({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-lime-600 focus:ring-lime-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function Stamp4Page() {
  const { t } = useTranslation()
  const [state, setState] = useState<Stamp4State>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const yearsNeeded = YEARS_NEEDED[state.status]
  const isImmediate = state.status === 'spouseCritical'

  const { eligible, targetDate, monthsRemaining } = useMemo(() => {
    if (isImmediate) return { eligible: true, targetDate: null, monthsRemaining: 0 }
    if (!state.startDate || yearsNeeded === null) return { eligible: false, targetDate: null, monthsRemaining: null }

    const start = new Date(state.startDate)
    const target = new Date(start)
    target.setFullYear(target.getFullYear() + yearsNeeded)
    const now = new Date('2026-04-25') // current date from context
    const eligible = now >= target
    const monthsRemaining = eligible ? 0 : Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))

    return { eligible, targetDate: target, monthsRemaining }
  }, [state.startDate, yearsNeeded, isImmediate])

  const checksOk = state.checks.continuous && state.checks.goodStanding
  const allPassed = (eligible || isImmediate) && (isImmediate || checksOk)

  const STATUS_OPTIONS: CurrentStatus[] = ['criticalSkills', 'generalPermit', 'spouseCritical', 'stamp1g', 'other']

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇮🇪 {t('ie.stamp4.title')}</h1>
          <p className="text-slate-500 text-sm">{t('ie.stamp4.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setState(DEMO)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Demo</button>
          <button onClick={() => setState(EMPTY)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">{t('common.clear')}</button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${
        state.status === 'other' ? 'bg-slate-50 border-slate-200' :
        allPassed ? 'bg-green-50 border-green-200' :
        isImmediate ? 'bg-green-50 border-green-200' :
        'bg-amber-50 border-amber-200'
      }`}>
        {state.status === 'other' ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">❓</span>
            <p className="text-slate-600 text-sm">{t('ie.stamp4.otherAdvice')}</p>
          </div>
        ) : isImmediate ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-lg font-bold text-green-800">{t('ie.stamp4.immediateEligible')}</p>
              <p className="text-sm text-slate-500">{t('ie.stamp4.immediateDesc')}</p>
            </div>
          </div>
        ) : eligible && checksOk ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-lg font-bold text-green-800">{t('ie.stamp4.eligible')}</p>
              <p className="text-sm text-slate-500">{t('ie.stamp4.eligibleDesc')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏳</span>
            <div>
              <p className="text-lg font-bold text-amber-800">{t('ie.stamp4.notYet')}</p>
              {monthsRemaining !== null && monthsRemaining > 0 && (
                <p className="text-sm text-slate-600">{t('ie.stamp4.monthsLeft', { months: monthsRemaining })}</p>
              )}
              {targetDate && (
                <p className="text-sm text-slate-500">{t('ie.stamp4.targetDate', { date: targetDate.toLocaleDateString('zh-HK') })}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Status selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">🗂️ {t('ie.stamp4.currentStatus')}</h2>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 border transition-colors
                hover:bg-slate-50 border-slate-200 has-[:checked]:border-lime-400 has-[:checked]:bg-lime-50">
                <input type="radio" name="status" value={opt} checked={state.status === opt}
                  onChange={() => setState(prev => ({ ...prev, status: opt }))}
                  className="w-4 h-4 text-lime-600 border-slate-300 focus:ring-lime-400" />
                <div>
                  <span className="text-sm font-medium text-slate-700">{t(`ie.stamp4.status.${opt}`)}</span>
                  <p className="text-xs text-slate-400">{t(`ie.stamp4.statusHint.${opt}`)}</p>
                </div>
                {YEARS_NEEDED[opt] !== null && YEARS_NEEDED[opt]! > 0 && (
                  <span className="ml-auto text-xs font-semibold text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">
                    {YEARS_NEEDED[opt]} {t('ie.stamp4.years')}
                  </span>
                )}
                {opt === 'spouseCritical' && (
                  <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {t('ie.stamp4.immediate')}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Start date */}
        {state.status !== 'other' && state.status !== 'spouseCritical' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">📅 {t('ie.stamp4.startDate')}</h2>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('ie.stamp4.startDateLabel')}</label>
              <input type="date" value={state.startDate}
                onChange={e => setState(prev => ({ ...prev, startDate: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
            </div>
          </div>
        )}

        {/* Other requirements */}
        {state.status !== 'other' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">✅ {t('ie.stamp4.otherRequirements')}</h2>
            <div className="space-y-4">
              <CheckRow label={t('ie.stamp4.criteria.continuous')} hint={t('ie.stamp4.criteria.continuousHint')}
                checked={!!state.checks.continuous} onChange={v => setCheck('continuous', v)} />
              <CheckRow label={t('ie.stamp4.criteria.goodStanding')} hint={t('ie.stamp4.criteria.goodStandingHint')}
                checked={!!state.checks.goodStanding} onChange={v => setCheck('goodStanding', v)} />
            </div>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('ie.stamp4.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

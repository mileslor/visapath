import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-ie-critical-skills'

interface CsState {
  checks: Record<string, boolean>
  salary: number
  onCsol: boolean
}

const EMPTY: CsState = { checks: {}, salary: 0, onCsol: true }
const DEMO: CsState = {
  checks: { jobOffer: true, qualification: true, employer: true },
  salary: 42000,
  onCsol: true,
}

// Salary thresholds (2024)
const CSOL_THRESHOLD = 38000
const HIGH_SALARY_THRESHOLD = 64000

function loadState(): CsState {
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
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-500 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function CriticalSkillsPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<CsState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const meetsPathA = state.onCsol && state.salary >= CSOL_THRESHOLD
  const meetsPathB = !state.onCsol && state.salary >= HIGH_SALARY_THRESHOLD
  const salaryOk = meetsPathA || meetsPathB
  const activePathRequired = ['jobOffer', 'qualification', 'employer']
  const requiredMet = activePathRequired.filter(id => state.checks[id]).length + (salaryOk ? 1 : 0)
  const totalRequired = activePathRequired.length + 1 // +1 for salary
  const allPassed = requiredMet === totalRequired

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇮🇪 {t('ie.cs.title')}</h1>
          <p className="text-slate-500 text-sm">{t('ie.cs.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setState(DEMO)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Demo</button>
          <button onClick={() => setState(EMPTY)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">{t('common.clear')}</button>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 mb-6 ${allPassed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{allPassed ? '✅' : '📋'}</span>
          <div>
            <p className={`text-lg font-bold ${allPassed ? 'text-green-800' : 'text-slate-700'}`}>
              {allPassed ? t('ie.cs.eligible') : t('ie.cs.inProgress')}
            </p>
            <p className="text-sm text-slate-500">
              {state.onCsol ? t('ie.cs.pathwayA') : t('ie.cs.pathwayB')} — {t('ie.cs.requiredMet', { met: requiredMet, total: totalRequired })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Occupation & Salary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">💼 {t('ie.cs.occupation')}</h2>

          <div className="mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={state.onCsol} onChange={e => setState(prev => ({ ...prev, onCsol: e.target.checked }))}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-500 cursor-pointer flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-slate-700">{t('ie.cs.onCsol')}</span>
                <p className="text-xs text-slate-400">{t('ie.cs.onCsolHint')}</p>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t('ie.cs.salaryLabel')}</label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">€</span>
              <input type="number" min={0} value={state.salary || ''}
                onChange={e => setState(prev => ({ ...prev, salary: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-green-500" />
              <span className="text-sm text-slate-500">{t('ie.cs.perYear')}</span>
            </div>
          </div>

          <div className={`mt-4 rounded-xl px-4 py-3 border ${salaryOk ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {state.onCsol ? (
              <p className="text-sm font-medium text-slate-700">
                {salaryOk ? '✅' : '❌'} {t('ie.cs.thresholdA', { amount: `€${CSOL_THRESHOLD.toLocaleString()}` })}
              </p>
            ) : (
              <p className="text-sm font-medium text-slate-700">
                {salaryOk ? '✅' : '❌'} {t('ie.cs.thresholdB', { amount: `€${HIGH_SALARY_THRESHOLD.toLocaleString()}` })}
              </p>
            )}
          </div>
        </div>

        {/* Other requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">✅ {t('ie.cs.otherRequirements')}</h2>
          <div className="space-y-4">
            <CheckRow label={t('ie.cs.criteria.jobOffer')} hint={t('ie.cs.criteria.jobOfferHint')}
              checked={!!state.checks.jobOffer} onChange={v => setCheck('jobOffer', v)} />
            <CheckRow label={t('ie.cs.criteria.qualification')} hint={t('ie.cs.criteria.qualificationHint')}
              checked={!!state.checks.qualification} onChange={v => setCheck('qualification', v)} />
            <CheckRow label={t('ie.cs.criteria.employer')} hint={t('ie.cs.criteria.employerHint')}
              checked={!!state.checks.employer} onChange={v => setCheck('employer', v)} />
          </div>
        </div>

        {/* Pathway info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">ℹ️ {t('ie.cs.pathwayInfo')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={`rounded-xl p-4 border ${state.onCsol ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-800 mb-1">{t('ie.cs.pathwayA')}</p>
              <p className="text-xs text-slate-500">{t('ie.cs.pathwayADesc', { amount: `€${CSOL_THRESHOLD.toLocaleString()}` })}</p>
            </div>
            <div className={`rounded-xl p-4 border ${!state.onCsol ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-800 mb-1">{t('ie.cs.pathwayB')}</p>
              <p className="text-xs text-slate-500">{t('ie.cs.pathwayBDesc', { amount: `€${HIGH_SALARY_THRESHOLD.toLocaleString()}` })}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('ie.cs.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

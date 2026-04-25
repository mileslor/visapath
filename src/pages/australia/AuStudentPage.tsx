import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-au-student'

interface AuStudentState {
  checks: Record<string, boolean>
  tuition: number
  hasPartner: boolean
  dependents: number
}

const EMPTY: AuStudentState = { checks: {}, tuition: 0, hasPartner: false, dependents: 0 }
const DEMO: AuStudentState = {
  checks: { cricos: true, oshc: true, english: true, genuine: true, health: true, character: true },
  tuition: 35000,
  hasPartner: false,
  dependents: 0,
}

const REQUIRED_IDS = ['cricos', 'oshc', 'english', 'genuine', 'health', 'character']
const LIVING_BASE = 21041
const PARTNER_AMT = 7362
const CHILD_AMT = 3620

function loadState(): AuStudentState {
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
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function AuStudentPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<AuStudentState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const requiredFunds = useMemo(() => {
    return state.tuition + LIVING_BASE + (state.hasPartner ? PARTNER_AMT : 0) + state.dependents * CHILD_AMT
  }, [state])

  const requiredMet = REQUIRED_IDS.filter(id => state.checks[id]).length
  const allPassed = requiredMet === REQUIRED_IDS.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇦🇺 {t('auStudent.title')}</h1>
          <p className="text-slate-500 text-sm">{t('auStudent.subtitle')}</p>
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
              {allPassed ? t('auStudent.eligible') : t('auStudent.inProgress')}
            </p>
            <p className="text-sm text-slate-500">{t('auStudent.requiredMet', { met: requiredMet, total: REQUIRED_IDS.length })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Financial calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">💰 {t('auStudent.calc.title')}</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('auStudent.calc.tuition')}</label>
              <input type="number" min={0} value={state.tuition || ''}
                onChange={e => setState(prev => ({ ...prev, tuition: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('auStudent.calc.partner')}</label>
              <select value={state.hasPartner ? 'yes' : 'no'} onChange={e => setState(prev => ({ ...prev, hasPartner: e.target.value === 'yes' }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="no">{t('auStudent.calc.no')}</option>
                <option value="yes">{t('auStudent.calc.yes')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('auStudent.calc.dependents')}</label>
              <input type="number" min={0} max={10} value={state.dependents || ''}
                onChange={e => setState(prev => ({ ...prev, dependents: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <div className="text-xs text-slate-500 space-y-0.5 mb-1">
              <p>{t('auStudent.calc.livingBase', { amt: `AUD ${LIVING_BASE.toLocaleString()}` })}</p>
              {state.hasPartner && <p>{t('auStudent.calc.partnerAmt', { amt: `AUD ${PARTNER_AMT.toLocaleString()}` })}</p>}
              {state.dependents > 0 && <p>{t('auStudent.calc.childAmt', { n: state.dependents, amt: `AUD ${(state.dependents * CHILD_AMT).toLocaleString()}` })}</p>}
            </div>
            <p className="text-2xl font-bold text-slate-900">AUD ${requiredFunds.toLocaleString()}</p>
          </div>
        </div>

        {/* Required */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">✅ {t('auStudent.required')}</h2>
          <div className="space-y-4">
            <CheckRow label={t('auStudent.criteria.cricos')} hint={t('auStudent.criteria.cricosHint')}
              checked={!!state.checks.cricos} onChange={v => setCheck('cricos', v)} />
            <CheckRow label={t('auStudent.criteria.oshc')} hint={t('auStudent.criteria.oshcHint')}
              checked={!!state.checks.oshc} onChange={v => setCheck('oshc', v)} />
            <CheckRow label={t('auStudent.criteria.english')} hint={t('auStudent.criteria.englishHint')}
              checked={!!state.checks.english} onChange={v => setCheck('english', v)} />
            <CheckRow label={t('auStudent.criteria.genuine')} hint={t('auStudent.criteria.genuineHint')}
              checked={!!state.checks.genuine} onChange={v => setCheck('genuine', v)} />
            <CheckRow label={t('auStudent.criteria.health')} hint={t('auStudent.criteria.healthHint')}
              checked={!!state.checks.health} onChange={v => setCheck('health', v)} />
            <CheckRow label={t('auStudent.criteria.character')} hint={t('auStudent.criteria.characterHint')}
              checked={!!state.checks.character} onChange={v => setCheck('character', v)} />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('auStudent.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

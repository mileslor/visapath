import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-uk-student'

interface UkStudentState {
  checks: Record<string, boolean>
  location: 'london' | 'outside'
  months: number
  tuition: number
}

const EMPTY: UkStudentState = {
  checks: {},
  location: 'outside',
  months: 12,
  tuition: 0,
}

const DEMO: UkStudentState = {
  checks: { cas: true, funds: true, english: true, passport: true, immigration: true },
  location: 'outside',
  months: 12,
  tuition: 20000,
}

const REQUIRED_IDS = ['cas', 'funds', 'english', 'passport', 'immigration']
const OPTIONAL_IDS = ['atas', 'tb']

function loadState(): UkStudentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return EMPTY
}

function CheckRow({ label, hint, checked, color, onChange }: {
  label: string; hint?: string; checked: boolean; color: string; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className={`mt-0.5 w-4 h-4 rounded border-slate-300 ${color} cursor-pointer flex-shrink-0`} />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function StudentVisaPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<UkStudentState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const MONTHLY = state.location === 'london' ? 1334 : 1023
  const calcMonths = Math.min(state.months, 9)
  const requiredFunds = useMemo(() => MONTHLY * calcMonths + state.tuition, [state])

  const requiredMet = REQUIRED_IDS.filter(id => state.checks[id]).length
  const allPassed = requiredMet === REQUIRED_IDS.length

  const color = 'text-blue-600 focus:ring-blue-400'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            🇬🇧 {t('ukStudent.title')}
          </h1>
          <p className="text-slate-500 text-sm">{t('ukStudent.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setState(DEMO)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Demo</button>
          <button onClick={() => setState(EMPTY)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">{t('common.clear')}</button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${allPassed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{allPassed ? '✅' : '📋'}</span>
          <div>
            <p className={`text-lg font-bold ${allPassed ? 'text-green-800' : 'text-slate-700'}`}>
              {allPassed ? t('ukStudent.eligible') : t('ukStudent.inProgress')}
            </p>
            <p className="text-sm text-slate-500">{t('ukStudent.requiredMet', { met: requiredMet, total: REQUIRED_IDS.length })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Financial calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">💰 {t('ukStudent.calc.title')}</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('ukStudent.calc.location')}</label>
              <select value={state.location} onChange={e => setState(prev => ({ ...prev, location: e.target.value as 'london' | 'outside' }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="london">{t('ukStudent.calc.london')}</option>
                <option value="outside">{t('ukStudent.calc.outside')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('ukStudent.calc.months')}</label>
              <input type="number" min={1} max={36} value={state.months || ''}
                onChange={e => setState(prev => ({ ...prev, months: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('ukStudent.calc.tuition')}</label>
              <input type="number" min={0} value={state.tuition || ''}
                onChange={e => setState(prev => ({ ...prev, tuition: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">{t('ukStudent.calc.formula', { rate: MONTHLY.toLocaleString(), months: calcMonths })}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">£{requiredFunds.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t('ukStudent.calc.note28days')}</p>
          </div>
        </div>

        {/* Required criteria */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">✅ {t('ukStudent.required')}</h2>
          <div className="space-y-4">
            <CheckRow color={color} label={t('ukStudent.criteria.cas')} hint={t('ukStudent.criteria.casHint')}
              checked={!!state.checks.cas} onChange={v => setCheck('cas', v)} />
            <CheckRow color={color} label={t('ukStudent.criteria.funds', { amount: `£${requiredFunds.toLocaleString()}` })}
              hint={t('ukStudent.criteria.fundsHint')}
              checked={!!state.checks.funds} onChange={v => setCheck('funds', v)} />
            <CheckRow color={color} label={t('ukStudent.criteria.english')} hint={t('ukStudent.criteria.englishHint')}
              checked={!!state.checks.english} onChange={v => setCheck('english', v)} />
            <CheckRow color={color} label={t('ukStudent.criteria.passport')} hint={t('ukStudent.criteria.passportHint')}
              checked={!!state.checks.passport} onChange={v => setCheck('passport', v)} />
            <CheckRow color={color} label={t('ukStudent.criteria.immigration')} hint={t('ukStudent.criteria.immigrationHint')}
              checked={!!state.checks.immigration} onChange={v => setCheck('immigration', v)} />
          </div>
        </div>

        {/* Optional criteria */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">{t('ukStudent.optional')}</h2>
          <p className="text-xs text-slate-400 mb-4">{t('ukStudent.optionalHint')}</p>
          <div className="space-y-4">
            <CheckRow color={color} label={t('ukStudent.criteria.atas')} hint={t('ukStudent.criteria.atasHint')}
              checked={!!state.checks.atas} onChange={v => setCheck('atas', v)} />
            <CheckRow color={color} label={t('ukStudent.criteria.tb')} hint={t('ukStudent.criteria.tbHint')}
              checked={!!state.checks.tb} onChange={v => setCheck('tb', v)} />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('ukStudent.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

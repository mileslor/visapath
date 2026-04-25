import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-canada-student'

interface CanadaStudentState {
  checks: Record<string, boolean>
  province: 'quebec' | 'other'
  tuition: number
}

const EMPTY: CanadaStudentState = { checks: {}, province: 'other', tuition: 0 }
const DEMO: CanadaStudentState = {
  checks: { loa: true, funds: true, passport: true, intent: true },
  province: 'other',
  tuition: 15000,
}

const REQUIRED_IDS = ['loa', 'funds', 'passport', 'intent']
const OPTIONAL_IDS = ['language', 'medical', 'biometrics']

function loadState(): CanadaStudentState {
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
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function CanadaStudentPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<CanadaStudentState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const LIVING = state.province === 'quebec' ? 11000 : 10000
  const requiredFunds = useMemo(() => state.tuition + LIVING + 3000, [state]) // +3000 for return fare estimate

  const requiredMet = REQUIRED_IDS.filter(id => state.checks[id]).length
  const allPassed = requiredMet === REQUIRED_IDS.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇨🇦 {t('canadaStudent.title')}</h1>
          <p className="text-slate-500 text-sm">{t('canadaStudent.subtitle')}</p>
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
              {allPassed ? t('canadaStudent.eligible') : t('canadaStudent.inProgress')}
            </p>
            <p className="text-sm text-slate-500">{t('canadaStudent.requiredMet', { met: requiredMet, total: REQUIRED_IDS.length })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Financial calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">💰 {t('canadaStudent.calc.title')}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('canadaStudent.calc.province')}</label>
              <select value={state.province} onChange={e => setState(prev => ({ ...prev, province: e.target.value as 'quebec' | 'other' }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                <option value="other">{t('canadaStudent.calc.otherProvince')}</option>
                <option value="quebec">{t('canadaStudent.calc.quebec')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('canadaStudent.calc.tuition')}</label>
              <input type="number" min={0} value={state.tuition || ''}
                onChange={e => setState(prev => ({ ...prev, tuition: Number(e.target.value) }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">{t('canadaStudent.calc.formula', { living: `CAD ${LIVING.toLocaleString()}` })}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">CAD ${requiredFunds.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t('canadaStudent.calc.note')}</p>
          </div>
        </div>

        {/* Required */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">✅ {t('canadaStudent.required')}</h2>
          <div className="space-y-4">
            <CheckRow label={t('canadaStudent.criteria.loa')} hint={t('canadaStudent.criteria.loaHint')}
              checked={!!state.checks.loa} onChange={v => setCheck('loa', v)} />
            <CheckRow label={t('canadaStudent.criteria.funds', { amount: `CAD $${requiredFunds.toLocaleString()}` })}
              hint={t('canadaStudent.criteria.fundsHint')}
              checked={!!state.checks.funds} onChange={v => setCheck('funds', v)} />
            <CheckRow label={t('canadaStudent.criteria.passport')} hint={t('canadaStudent.criteria.passportHint')}
              checked={!!state.checks.passport} onChange={v => setCheck('passport', v)} />
            <CheckRow label={t('canadaStudent.criteria.intent')} hint={t('canadaStudent.criteria.intentHint')}
              checked={!!state.checks.intent} onChange={v => setCheck('intent', v)} />
          </div>
        </div>

        {/* Optional */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">{t('canadaStudent.optional')}</h2>
          <p className="text-xs text-slate-400 mb-4">{t('canadaStudent.optionalHint')}</p>
          <div className="space-y-4">
            <CheckRow label={t('canadaStudent.criteria.language')} hint={t('canadaStudent.criteria.languageHint')}
              checked={!!state.checks.language} onChange={v => setCheck('language', v)} />
            <CheckRow label={t('canadaStudent.criteria.medical')} hint={t('canadaStudent.criteria.medicalHint')}
              checked={!!state.checks.medical} onChange={v => setCheck('medical', v)} />
            <CheckRow label={t('canadaStudent.criteria.biometrics')} hint={t('canadaStudent.criteria.biometricsHint')}
              checked={!!state.checks.biometrics} onChange={v => setCheck('biometrics', v)} />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('canadaStudent.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

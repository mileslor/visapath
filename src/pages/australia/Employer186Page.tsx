import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'visapath-au-186'

type Stream = 'trt' | 'de'

interface Au186State {
  stream: Stream
  checks: Record<string, boolean>
}

const EMPTY: Au186State = { stream: 'trt', checks: {} }
const DEMO: Au186State = {
  stream: 'trt',
  checks: { inAustralia: true, threeYears: true, tssDollar: true, under45: true, english: true },
}

const TRT_REQUIRED = ['inAustralia', 'threeYears', 'tssDollar', 'under45', 'english']
const DE_REQUIRED = ['skillsAssessment', 'employerNomination', 'under45', 'englishDe']

function loadState(): Au186State {
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
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function Employer186Page() {
  const { t } = useTranslation()
  const [state, setState] = useState<Au186State>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const required = state.stream === 'trt' ? TRT_REQUIRED : DE_REQUIRED
  const requiredMet = required.filter(id => state.checks[id]).length
  const allPassed = requiredMet === required.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇦🇺 {t('au186.title')}</h1>
          <p className="text-slate-500 text-sm">{t('au186.subtitle')}</p>
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
              {allPassed ? t('au186.eligible') : t('au186.inProgress')}
            </p>
            <p className="text-sm text-slate-500">{t('au186.requiredMet', { met: requiredMet, total: required.length })}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stream selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">🔀 {t('au186.selectStream')}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['trt', 'de'] as Stream[]).map(s => (
              <label key={s} className={`flex items-start gap-3 cursor-pointer rounded-xl p-4 border transition-colors
                hover:bg-slate-50 ${state.stream === s ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
                <input type="radio" name="stream" value={s} checked={state.stream === s}
                  onChange={() => setState(prev => ({ ...prev, stream: s, checks: {} }))}
                  className="mt-0.5 w-4 h-4 text-green-600 border-slate-300 focus:ring-green-400" />
                <div>
                  <span className="text-sm font-semibold text-slate-800">{t(`au186.stream.${s}`)}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{t(`au186.streamDesc.${s}`)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* TRT criteria */}
        {state.stream === 'trt' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">✅ {t('au186.trt.requirements')}</h2>
            <div className="space-y-4">
              <CheckRow label={t('au186.trt.inAustralia')} hint={t('au186.trt.inAustraliaHint')}
                checked={!!state.checks.inAustralia} onChange={v => setCheck('inAustralia', v)} />
              <CheckRow label={t('au186.trt.threeYears')} hint={t('au186.trt.threeYearsHint')}
                checked={!!state.checks.threeYears} onChange={v => setCheck('threeYears', v)} />
              <CheckRow label={t('au186.trt.tssDollar')} hint={t('au186.trt.tssDollarHint')}
                checked={!!state.checks.tssDollar} onChange={v => setCheck('tssDollar', v)} />
              <CheckRow label={t('au186.trt.under45')} hint={t('au186.trt.under45Hint')}
                checked={!!state.checks.under45} onChange={v => setCheck('under45', v)} />
              <CheckRow label={t('au186.trt.english')} hint={t('au186.trt.englishHint')}
                checked={!!state.checks.english} onChange={v => setCheck('english', v)} />
            </div>
          </div>
        )}

        {/* DE criteria */}
        {state.stream === 'de' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">✅ {t('au186.de.requirements')}</h2>
              <div className="space-y-4">
                <CheckRow label={t('au186.de.skillsAssessment')} hint={t('au186.de.skillsAssessmentHint')}
                  checked={!!state.checks.skillsAssessment} onChange={v => setCheck('skillsAssessment', v)} />
                <CheckRow label={t('au186.de.employerNomination')} hint={t('au186.de.employerNominationHint')}
                  checked={!!state.checks.employerNomination} onChange={v => setCheck('employerNomination', v)} />
                <CheckRow label={t('au186.de.under45')} hint={t('au186.de.under45Hint')}
                  checked={!!state.checks.under45} onChange={v => setCheck('under45', v)} />
                <CheckRow label={t('au186.de.englishDe')} hint={t('au186.de.englishDeHint')}
                  checked={!!state.checks.englishDe} onChange={v => setCheck('englishDe', v)} />
              </div>
            </div>

            {/* Points note for DE */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-blue-800 mb-1">📊 {t('au186.de.pointsNote')}</p>
              <p className="text-sm text-blue-700 mb-3">{t('au186.de.pointsDesc')}</p>
              <Link to="/australia/points"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                {t('au186.de.goToPoints')} →
              </Link>
            </div>
          </>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('au186.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

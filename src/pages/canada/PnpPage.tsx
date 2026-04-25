import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-canada-pnp'

type Province = 'bc' | 'ontario' | 'alberta' | 'saskatchewan' | 'other'

interface PnpState {
  province: Province
  checks: Record<string, boolean>
  hasBcJobOffer: boolean
  hasOnJobOffer: boolean
  hasAbJobOffer: boolean
  hasSaskJobOffer: boolean
  inExpressEntry: boolean
  occupation: string
}

const EMPTY: PnpState = {
  province: 'bc',
  checks: {},
  hasBcJobOffer: false,
  hasOnJobOffer: false,
  hasAbJobOffer: false,
  hasSaskJobOffer: false,
  inExpressEntry: false,
  occupation: '',
}

const DEMO: PnpState = {
  ...EMPTY,
  province: 'bc',
  hasBcJobOffer: true,
  inExpressEntry: true,
  checks: { bcWorkAuth: true, bcNocAB: true },
}

function loadState(): PnpState {
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

function BoolRow({ label, hint, value, onChange }: {
  label: string; hint?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function PnpPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<PnpState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function setCheck(id: string, val: boolean) {
    setState(prev => ({ ...prev, checks: { ...prev.checks, [id]: val } }))
  }

  const PROVINCES: Province[] = ['bc', 'ontario', 'alberta', 'saskatchewan', 'other']

  // BC eligibility
  const bcEligible = state.hasBcJobOffer && (state.checks.bcWorkAuth || state.inExpressEntry) && state.checks.bcNocAB
  // Ontario eligibility
  const onEligible = state.hasOnJobOffer && state.inExpressEntry && state.checks.onTechOccupation
  // Alberta eligibility
  const abEligible = state.hasAbJobOffer || (state.inExpressEntry && state.checks.abEeStream)
  // Saskatchewan eligibility
  const saskEligible = state.hasSaskJobOffer && state.checks.saskExperience

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇨🇦 {t('pnp.title')}</h1>
          <p className="text-slate-500 text-sm">{t('pnp.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setState(DEMO)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Demo</button>
          <button onClick={() => setState(EMPTY)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">{t('common.clear')}</button>
        </div>
      </div>

      {/* PNP benefit note */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold text-red-800 mb-1">⭐ {t('pnp.benefit')}</p>
        <p className="text-sm text-red-700">{t('pnp.benefitDesc')}</p>
      </div>

      <div className="space-y-6">
        {/* Base profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">👤 {t('pnp.profile')}</h2>
          <div className="space-y-4">
            <BoolRow label={t('pnp.inExpressEntry')} hint={t('pnp.inExpressEntryHint')}
              value={state.inExpressEntry} onChange={v => setState(prev => ({ ...prev, inExpressEntry: v }))} />
          </div>
        </div>

        {/* Province selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">🗺️ {t('pnp.selectProvince')}</h2>
          <div className="flex flex-wrap gap-2">
            {PROVINCES.map(p => (
              <button key={p} onClick={() => setState(prev => ({ ...prev, province: p, checks: {} }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${state.province === p ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {t(`pnp.province.${p}`)}
              </button>
            ))}
          </div>
        </div>

        {/* BC PNP */}
        {state.province === 'bc' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">🏔️ {t('pnp.bc.title')}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bcEligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {bcEligible ? t('pnp.likelyEligible') : t('pnp.checkRequirements')}
              </span>
            </div>
            <div className="space-y-4">
              <BoolRow label={t('pnp.bc.jobOffer')} hint={t('pnp.bc.jobOfferHint')}
                value={state.hasBcJobOffer} onChange={v => setState(prev => ({ ...prev, hasBcJobOffer: v }))} />
              <CheckRow label={t('pnp.bc.nocAB')} hint={t('pnp.bc.nocABHint')}
                checked={!!state.checks.bcNocAB} onChange={v => setCheck('bcNocAB', v)} />
              <CheckRow label={t('pnp.bc.workAuth')} hint={t('pnp.bc.workAuthHint')}
                checked={!!state.checks.bcWorkAuth} onChange={v => setCheck('bcWorkAuth', v)} />
            </div>
            <div className="mt-4 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500">{t('pnp.bc.note')}</p>
            </div>
          </div>
        )}

        {/* Ontario OINP */}
        {state.province === 'ontario' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">🏙️ {t('pnp.ontario.title')}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${onEligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {onEligible ? t('pnp.likelyEligible') : t('pnp.checkRequirements')}
              </span>
            </div>
            <div className="space-y-4">
              <BoolRow label={t('pnp.ontario.jobOffer')} hint={t('pnp.ontario.jobOfferHint')}
                value={state.hasOnJobOffer} onChange={v => setState(prev => ({ ...prev, hasOnJobOffer: v }))} />
              <CheckRow label={t('pnp.ontario.techOccupation')} hint={t('pnp.ontario.techOccupationHint')}
                checked={!!state.checks.onTechOccupation} onChange={v => setCheck('onTechOccupation', v)} />
            </div>
            <div className="mt-4 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500">{t('pnp.ontario.note')}</p>
            </div>
          </div>
        )}

        {/* Alberta AAIP */}
        {state.province === 'alberta' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">🌾 {t('pnp.alberta.title')}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${abEligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {abEligible ? t('pnp.likelyEligible') : t('pnp.checkRequirements')}
              </span>
            </div>
            <div className="space-y-4">
              <BoolRow label={t('pnp.alberta.jobOffer')} hint={t('pnp.alberta.jobOfferHint')}
                value={state.hasAbJobOffer} onChange={v => setState(prev => ({ ...prev, hasAbJobOffer: v }))} />
              <CheckRow label={t('pnp.alberta.eeStream')} hint={t('pnp.alberta.eeStreamHint')}
                checked={!!state.checks.abEeStream} onChange={v => setCheck('abEeStream', v)} />
            </div>
            <div className="mt-4 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500">{t('pnp.alberta.note')}</p>
            </div>
          </div>
        )}

        {/* Saskatchewan */}
        {state.province === 'saskatchewan' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">🌻 {t('pnp.sask.title')}</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${saskEligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {saskEligible ? t('pnp.likelyEligible') : t('pnp.checkRequirements')}
              </span>
            </div>
            <div className="space-y-4">
              <BoolRow label={t('pnp.sask.jobOffer')} hint={t('pnp.sask.jobOfferHint')}
                value={state.hasSaskJobOffer} onChange={v => setState(prev => ({ ...prev, hasSaskJobOffer: v }))} />
              <CheckRow label={t('pnp.sask.experience')} hint={t('pnp.sask.experienceHint')}
                checked={!!state.checks.saskExperience} onChange={v => setCheck('saskExperience', v)} />
            </div>
          </div>
        )}

        {/* Other provinces */}
        {state.province === 'other' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-600">{t('pnp.other.info')}</p>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('pnp.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

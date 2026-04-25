import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'visapath-canada-rnip'

type NocLevel = '0A' | 'B' | 'CD'
type Province = 'all' | 'ontario' | 'manitoba' | 'saskatchewan' | 'alberta' | 'bc'

interface RnipState {
  workExpYears: number
  workExpHours: number
  nocLevel: NocLevel
  clbLevel: number
  education: 'highSchool' | 'college' | 'bachelors' | 'masters' | 'phd'
  hasEca: boolean
  hasFunds: boolean
  communityLink: 'none' | 'family' | 'study' | 'work' | 'travel'
  preferredProvince: Province
  hasJobOffer: boolean
}

const EMPTY: RnipState = {
  workExpYears: 0,
  workExpHours: 0,
  nocLevel: '0A',
  clbLevel: 0,
  education: 'highSchool',
  hasEca: false,
  hasFunds: false,
  communityLink: 'none',
  preferredProvince: 'all',
  hasJobOffer: false,
}

const DEMO: RnipState = {
  workExpYears: 2,
  workExpHours: 1800,
  nocLevel: 'B',
  clbLevel: 7,
  education: 'bachelors',
  hasEca: true,
  hasFunds: true,
  communityLink: 'none',
  preferredProvince: 'all',
  hasJobOffer: false,
}

interface Community {
  name: string
  province: Province
  provinceLabel: string
  population: string
  highlights: string[]
}

const COMMUNITIES: Community[] = [
  { name: 'North Bay', province: 'ontario', provinceLabel: 'Ontario', population: '~51,000', highlights: ['Healthcare', 'Education', 'Mining'] },
  { name: 'Sudbury', province: 'ontario', provinceLabel: 'Ontario', population: '~161,000', highlights: ['Mining', 'Healthcare', 'Education'] },
  { name: 'Timmins', province: 'ontario', provinceLabel: 'Ontario', population: '~41,000', highlights: ['Mining', 'Healthcare'] },
  { name: 'Sault Ste. Marie', province: 'ontario', provinceLabel: 'Ontario', population: '~73,000', highlights: ['Manufacturing', 'Healthcare'] },
  { name: 'Thunder Bay', province: 'ontario', provinceLabel: 'Ontario', population: '~107,000', highlights: ['Healthcare', 'Education', 'Forestry'] },
  { name: 'Brandon', province: 'manitoba', provinceLabel: 'Manitoba', population: '~52,000', highlights: ['Agriculture', 'Manufacturing'] },
  { name: 'Altona / Rhineland', province: 'manitoba', provinceLabel: 'Manitoba', population: '~14,000', highlights: ['Agriculture', 'Manufacturing'] },
  { name: 'Moose Jaw', province: 'saskatchewan', provinceLabel: 'Saskatchewan', population: '~34,000', highlights: ['Agriculture', 'Healthcare'] },
  { name: 'Claresholm', province: 'alberta', provinceLabel: 'Alberta', population: '~3,800', highlights: ['Agriculture', 'Ranching'] },
  { name: 'Vernon', province: 'bc', provinceLabel: 'British Columbia', population: '~41,000', highlights: ['Agriculture', 'Tourism', 'Healthcare'] },
  { name: 'West Kootenay', province: 'bc', provinceLabel: 'British Columbia', population: '~30,000', highlights: ['Mining', 'Forestry', 'Tourism'] },
]

const CLB_MIN: Record<NocLevel, number> = { '0A': 6, 'B': 6, 'CD': 5 }

function loadState(): RnipState {
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

export default function RnipPage() {
  const { t } = useTranslation()
  const [state, setState] = useState<RnipState>(loadState)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }, [state])

  function set<K extends keyof RnipState>(key: K, value: RnipState[K]) {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const minClb = CLB_MIN[state.nocLevel]
  const meetsExp = state.workExpYears >= 1 && state.workExpHours >= 1560
  const meetsLang = state.clbLevel >= minClb
  const meetsEdu = true // High school is minimum, all options qualify
  const meetsFunds = state.hasFunds
  const meetsEca = state.education === 'highSchool' || state.hasEca

  const criteria = [
    { id: 'exp', ok: meetsExp },
    { id: 'lang', ok: meetsLang },
    { id: 'edu', ok: meetsEca },
    { id: 'funds', ok: meetsFunds },
  ]
  const metCount = criteria.filter(c => c.ok).length
  const basicEligible = metCount === criteria.length

  const filteredCommunities = useMemo(() =>
    state.preferredProvince === 'all'
      ? COMMUNITIES
      : COMMUNITIES.filter(c => c.province === state.preferredProvince),
    [state.preferredProvince]
  )

  const NOC_OPTIONS: NocLevel[] = ['0A', 'B', 'CD']
  const CLB_OPTIONS = [0, 4, 5, 6, 7, 8, 9, 10]
  const PROVINCE_OPTIONS: { value: Province; label: string }[] = [
    { value: 'all', label: t('rnip.province.all') },
    { value: 'ontario', label: 'Ontario' },
    { value: 'bc', label: 'British Columbia' },
    { value: 'alberta', label: 'Alberta' },
    { value: 'saskatchewan', label: 'Saskatchewan' },
    { value: 'manitoba', label: 'Manitoba' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">🇨🇦 {t('rnip.title')}</h1>
          <p className="text-slate-500 text-sm">{t('rnip.subtitle')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setState(DEMO)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Demo</button>
          <button onClick={() => setState(EMPTY)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">{t('common.clear')}</button>
        </div>
      </div>

      {/* Status warning */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ {t('rnip.statusWarning')}</p>
        <p className="text-xs text-amber-700">{t('rnip.statusDesc')}</p>
      </div>

      {/* Eligibility banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${basicEligible ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{basicEligible ? '✅' : '📋'}</span>
          <div>
            <p className={`text-lg font-bold ${basicEligible ? 'text-green-800' : 'text-slate-700'}`}>
              {basicEligible ? t('rnip.eligible') : t('rnip.inProgress')}
            </p>
            <p className="text-sm text-slate-500">{t('rnip.metCount', { met: metCount, total: criteria.length })}</p>
            {state.hasJobOffer && basicEligible && (
              <p className="text-sm text-green-700 font-semibold mt-1">🎉 {t('rnip.hasJobOfferNote')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Work experience */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">1️⃣ {t('rnip.section.work')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.nocLevel')}</label>
              <select value={state.nocLevel} onChange={e => set('nocLevel', e.target.value as NocLevel)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                {NOC_OPTIONS.map(o => (
                  <option key={o} value={o}>{t(`rnip.noc.${o}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.workYears')}</label>
              <input type="number" min={0} max={20} value={state.workExpYears || ''}
                onChange={e => set('workExpYears', Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.workHours')}</label>
              <input type="number" min={0} value={state.workExpHours || ''}
                onChange={e => set('workExpHours', Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
          </div>
          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${meetsExp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {meetsExp ? '✅' : '❌'} {t('rnip.expRequirement')}
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">2️⃣ {t('rnip.section.language')}</h2>
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.clb')}</label>
            <select value={state.clbLevel} onChange={e => set('clbLevel', Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400">
              {CLB_OPTIONS.map(c => (
                <option key={c} value={c}>{c === 0 ? t('rnip.clb.none') : `CLB ${c}`}</option>
              ))}
            </select>
          </div>
          <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${meetsLang ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {meetsLang ? '✅' : '❌'} {t('rnip.langRequirement', { min: minClb })}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">3️⃣ {t('rnip.section.education')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.education')}</label>
              <select value={state.education} onChange={e => set('education', e.target.value as RnipState['education'])}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                {(['highSchool', 'college', 'bachelors', 'masters', 'phd'] as const).map(o => (
                  <option key={o} value={o}>{t(`rnip.edu.${o}`)}</option>
                ))}
              </select>
            </div>
            {state.education !== 'highSchool' && (
              <div className="flex items-center">
                <CheckRow label={t('rnip.field.eca')} hint={t('rnip.field.ecaHint')}
                  checked={state.hasEca} onChange={v => set('hasEca', v)} />
              </div>
            )}
          </div>
          {state.education !== 'highSchool' && (
            <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${meetsEca ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {meetsEca ? '✅' : '⚠️'} {t('rnip.ecaNote')}
            </div>
          )}
        </div>

        {/* Other requirements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">4️⃣ {t('rnip.section.other')}</h2>
          <div className="space-y-4">
            <CheckRow label={t('rnip.field.funds')} hint={t('rnip.field.fundsHint')}
              checked={state.hasFunds} onChange={v => set('hasFunds', v)} />
            <CheckRow label={t('rnip.field.jobOffer')} hint={t('rnip.field.jobOfferHint')}
              checked={state.hasJobOffer} onChange={v => set('hasJobOffer', v)} />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1">{t('rnip.field.communityLink')}</label>
            <select value={state.communityLink} onChange={e => set('communityLink', e.target.value as RnipState['communityLink'])}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-400">
              {(['none', 'family', 'study', 'work', 'travel'] as const).map(o => (
                <option key={o} value={o}>{t(`rnip.link.${o}`)}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">{t('rnip.field.communityLinkHint')}</p>
          </div>
        </div>

        {/* Community matching */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">🏘️ {t('rnip.communities')}</h2>
            <select value={state.preferredProvince} onChange={e => set('preferredProvince', e.target.value as Province)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400">
              {PROVINCE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {filteredCommunities.map(c => (
              <div key={c.name} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.provinceLabel} · {t('rnip.population')}: {c.population}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {c.highlights.map(h => (
                      <span key={h} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">{t('rnip.communityNote')}</p>
        </div>

        {/* Next steps */}
        {basicEligible && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h2 className="font-semibold text-green-800 mb-3">🚀 {t('rnip.nextSteps')}</h2>
            <ol className="space-y-2 text-sm text-green-800 list-decimal list-inside">
              <li>{t('rnip.step1')}</li>
              <li>{t('rnip.step2')}</li>
              <li>{t('rnip.step3')}</li>
              <li>{t('rnip.step4')}</li>
            </ol>
          </div>
        )}

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('rnip.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

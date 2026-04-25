import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CrsInput, EducationLevel, CLBLevel, WorkExpYears } from '../../lib/canada/crs'
import { calculateCrs, RECENT_CUTOFFS } from '../../lib/canada/crs'

const DEFAULT_INPUT: CrsInput = {
  age: 30,
  education: 'bachelors',
  hasSpouse: false,
  speaking: 9, listening: 9, reading: 9, writing: 9,
  speaking2: 0, listening2: 0, reading2: 0, writing2: 0,
  canadaWorkExp: 0,
  foreignWorkExp: 1,
  spouseEducation: 'bachelors',
  spouseLanguageCLB: 0,
  spouseCanadaWorkExp: 0,
  hasProvincialNomination: false,
  hasJobOffer: false,
  jobOfferNoc00: false,
  hasCanadianSibling: false,
  hasFrenchProficiency: false,
  studiedInCanada: false,
}

const EDU_OPTIONS: { value: EducationLevel; labelKey: string }[] = [
  { value: 'none', labelKey: 'canada.edu.none' },
  { value: 'highSchool', labelKey: 'canada.edu.highSchool' },
  { value: 'oneYear', labelKey: 'canada.edu.oneYear' },
  { value: 'twoYear', labelKey: 'canada.edu.twoYear' },
  { value: 'bachelors', labelKey: 'canada.edu.bachelors' },
  { value: 'twoOrMoreDegrees', labelKey: 'canada.edu.twoOrMoreDegrees' },
  { value: 'masters', labelKey: 'canada.edu.masters' },
  { value: 'phd', labelKey: 'canada.edu.phd' },
]

const CLB_OPTIONS: CLBLevel[] = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const WORK_EXP_OPTIONS: WorkExpYears[] = [0, 1, 2, 3, 4, 5, 6]

function ScoreBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{value}</span>
    </div>
  )
}

function Select<T extends string | number>({ label, value, options, onChange, renderOption }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void;
  renderOption: (v: T) => string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <select
        value={String(value)}
        onChange={e => onChange(options.find(o => String(o) === e.target.value) ?? options[0])}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white w-full"
      >
        {options.map(o => (
          <option key={String(o)} value={String(o)}>{renderOption(o)}</option>
        ))}
      </select>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function CanadaCrsPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState<CrsInput>(DEFAULT_INPUT)

  function set<K extends keyof CrsInput>(key: K, value: CrsInput[K]) {
    setInput(prev => ({ ...prev, [key]: value }))
  }

  const breakdown = useMemo(() => calculateCrs(input), [input])

  const lastCutoff = RECENT_CUTOFFS[RECENT_CUTOFFS.length - 1]
  const gapToLastCutoff = lastCutoff.score - breakdown.total

  const clbLabel = (c: CLBLevel) => c === 0 ? t('canada.clb.none') : `CLB ${c}`
  const workLabel = (y: WorkExpYears) => y === 0 ? t('canada.work.none') : y >= 6 ? t('canada.work.6plus') : `${y} ${t('canada.work.years')}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          🇨🇦 {t('canada.crs.title')}
        </h1>
        <p className="text-slate-500 text-sm">{t('canada.crs.subtitle')}</p>
      </div>

      {/* Score banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${
        breakdown.total >= lastCutoff.score ? 'bg-green-50 border-green-200' :
        breakdown.total >= lastCutoff.score - 50 ? 'bg-amber-50 border-amber-200' :
        'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{t('canada.crs.yourScore')}</p>
            <p className="text-5xl font-bold text-slate-900">{breakdown.total}</p>
            <p className="text-xs text-slate-500 mt-1">{t('canada.crs.maxScore')}: 1,200</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">{t('canada.crs.recentCutoff')} ({lastCutoff.date})</p>
            <p className="text-2xl font-bold text-slate-700">{lastCutoff.score}</p>
            <p className={`text-sm font-semibold mt-1 ${gapToLastCutoff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gapToLastCutoff <= 0
                ? `✅ ${t('canada.crs.aboveCutoff')} (+${Math.abs(gapToLastCutoff)})`
                : `${t('canada.crs.belowCutoff')} (−${gapToLastCutoff})`
              }
            </p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
          <ScoreBar value={breakdown.age} max={110} label={t('canada.crs.breakdown.age')} />
          <ScoreBar value={breakdown.education} max={150} label={t('canada.crs.breakdown.education')} />
          <ScoreBar value={breakdown.language1} max={136} label={t('canada.crs.breakdown.language1')} />
          <ScoreBar value={breakdown.language2} max={24} label={t('canada.crs.breakdown.language2')} />
          <ScoreBar value={breakdown.canadaWorkExp} max={80} label={t('canada.crs.breakdown.canadaWork')} />
          {input.hasSpouse && <ScoreBar value={breakdown.spouseFactors} max={40} label={t('canada.crs.breakdown.spouse')} />}
          <ScoreBar value={breakdown.skillTransferability} max={100} label={t('canada.crs.breakdown.skillTransfer')} />
          <ScoreBar value={breakdown.additional} max={600} label={t('canada.crs.breakdown.additional')} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Core */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">1️⃣ {t('canada.section.core')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('canada.field.age')}</label>
              <input type="number" min={17} max={65} value={input.age}
                onChange={e => set('age', Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 w-24" />
            </div>
            <Select label={t('canada.field.education')} value={input.education}
              options={EDU_OPTIONS.map(o => o.value)}
              onChange={v => set('education', v)}
              renderOption={v => t(EDU_OPTIONS.find(o => o.value === v)?.labelKey ?? '')} />
          </div>
          <div className="mt-4">
            <Toggle label={t('canada.field.hasSpouse')} checked={input.hasSpouse} onChange={v => set('hasSpouse', v)} />
          </div>
        </div>

        {/* Section 2: First language */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">2️⃣ {t('canada.section.lang1')}</h2>
          <p className="text-xs text-slate-400 mb-4">{t('canada.section.lang1Hint')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['speaking', 'listening', 'reading', 'writing'] as const).map(skill => (
              <Select key={skill} label={t(`canada.skill.${skill}`)} value={input[skill] as CLBLevel}
                options={CLB_OPTIONS} onChange={v => set(skill, v)} renderOption={clbLabel} />
            ))}
          </div>
        </div>

        {/* Section 3: Second language */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">3️⃣ {t('canada.section.lang2')}</h2>
          <p className="text-xs text-slate-400 mb-4">{t('canada.section.lang2Hint')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['speaking2', 'listening2', 'reading2', 'writing2'] as const).map(skill => (
              <Select key={skill} label={t(`canada.skill.${skill.replace('2', '')}`)} value={input[skill] as CLBLevel}
                options={CLB_OPTIONS} onChange={v => set(skill, v)} renderOption={clbLabel} />
            ))}
          </div>
        </div>

        {/* Section 4: Work experience */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">4️⃣ {t('canada.section.work')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label={t('canada.field.canadaWork')} value={input.canadaWorkExp}
              options={WORK_EXP_OPTIONS} onChange={v => set('canadaWorkExp', v)} renderOption={workLabel} />
            <Select label={t('canada.field.foreignWork')} value={input.foreignWorkExp}
              options={WORK_EXP_OPTIONS} onChange={v => set('foreignWorkExp', v)} renderOption={workLabel} />
          </div>
        </div>

        {/* Section 5: Spouse */}
        {input.hasSpouse && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">5️⃣ {t('canada.section.spouse')}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Select label={t('canada.field.spouseEdu')} value={input.spouseEducation}
                options={EDU_OPTIONS.map(o => o.value)} onChange={v => set('spouseEducation', v)}
                renderOption={v => t(EDU_OPTIONS.find(o => o.value === v)?.labelKey ?? '')} />
              <Select label={t('canada.field.spouseLang')} value={input.spouseLanguageCLB}
                options={CLB_OPTIONS} onChange={v => set('spouseLanguageCLB', v)} renderOption={clbLabel} />
              <Select label={t('canada.field.spouseWork')} value={input.spouseCanadaWorkExp}
                options={WORK_EXP_OPTIONS} onChange={v => set('spouseCanadaWorkExp', v)} renderOption={workLabel} />
            </div>
          </div>
        )}

        {/* Section 6: Additional */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">{input.hasSpouse ? '6️⃣' : '5️⃣'} {t('canada.section.additional')}</h2>
          <div className="space-y-3">
            <Toggle label={t('canada.additional.pnp')} hint={t('canada.additional.pnpHint')}
              checked={input.hasProvincialNomination} onChange={v => set('hasProvincialNomination', v)} />
            <Toggle label={t('canada.additional.jobOffer')} hint={t('canada.additional.jobOfferHint')}
              checked={input.hasJobOffer} onChange={v => set('hasJobOffer', v)} />
            {input.hasJobOffer && (
              <Toggle label={t('canada.additional.jobOfferNoc00')} hint={t('canada.additional.jobOfferNoc00Hint')}
                checked={input.jobOfferNoc00} onChange={v => set('jobOfferNoc00', v)} />
            )}
            <Toggle label={t('canada.additional.sibling')} hint={t('canada.additional.siblingHint')}
              checked={input.hasCanadianSibling} onChange={v => set('hasCanadianSibling', v)} />
            <Toggle label={t('canada.additional.french')} hint={t('canada.additional.frenchHint')}
              checked={input.hasFrenchProficiency} onChange={v => set('hasFrenchProficiency', v)} />
            <Toggle label={t('canada.additional.studiedInCanada')} hint={t('canada.additional.studiedInCanadaHint')}
              checked={input.studiedInCanada} onChange={v => set('studiedInCanada', v)} />
          </div>
        </div>

        {/* Recent cutoffs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">📊 {t('canada.crs.cutoffHistory')}</h2>
          <div className="flex flex-wrap gap-2">
            {RECENT_CUTOFFS.map(c => (
              <div key={c.date} className={`rounded-lg px-3 py-2 text-xs border ${
                breakdown.total >= c.score ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-slate-400">{c.date}</p>
                <p className="font-semibold text-slate-700">{c.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('canada.crs.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

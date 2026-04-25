import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AuPointsInput, EnglishLevel, OverseasExpYears, AustralianExpYears, EduLevel } from '../../lib/australia/points'
import { calculateAuPoints, RECENT_AU_CUTOFFS } from '../../lib/australia/points'

const DEFAULT_INPUT: AuPointsInput = {
  age: 28, english: 'proficient',
  overseasWorkExp: 3, australianWorkExp: 0,
  education: 'bachelors',
  australianStudy: false, specialistEducation: false,
  partnerSkills: false, partnerEnglishCompetent: false,
  stateNomination: false, regionalSponsorship: false,
  communityLanguage: false, studyInRegional: false, professionalYear: false,
}

function ScoreBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10 text-right">{value}</span>
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-yellow-600 focus:ring-yellow-400 cursor-pointer flex-shrink-0" />
      <div>
        <span className="text-sm font-medium text-slate-700 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

function SelectField<T extends string | number>({ label, value, options, renderOption, onChange }: {
  label: string; value: T; options: T[]; renderOption: (v: T) => string; onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <select value={String(value)} onChange={e => onChange(options.find(o => String(o) === e.target.value) ?? options[0])}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white w-full">
        {options.map(o => <option key={String(o)} value={String(o)}>{renderOption(o)}</option>)}
      </select>
    </div>
  )
}

export default function AustraliaPointsPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState<AuPointsInput>(DEFAULT_INPUT)

  function set<K extends keyof AuPointsInput>(key: K, value: AuPointsInput[K]) {
    setInput(prev => ({ ...prev, [key]: value }))
  }

  const result = useMemo(() => calculateAuPoints(input), [input])
  const lastCutoff = RECENT_AU_CUTOFFS[RECENT_AU_CUTOFFS.length - 1]

  const engOptions: EnglishLevel[] = ['none', 'competent', 'proficient', 'superior']
  const overseasOptions: OverseasExpYears[] = [0, 3, 5, 8, 10]
  const auOptions: AustralianExpYears[] = [0, 1, 3, 5, 8, 10]
  const eduOptions: EduLevel[] = ['none', 'diploma', 'bachelors', 'doctorate']
  const expYearLabel = (y: number) => y === 0 ? t('au.exp.none') : `${y}+ ${t('au.exp.years')}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          🇦🇺 {t('au.title')}
        </h1>
        <p className="text-slate-500 text-sm">{t('au.subtitle')}</p>
      </div>

      {/* Score banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${
        result.passesThreshold && result.total >= lastCutoff.score ? 'bg-green-50 border-green-200' :
        result.passesThreshold ? 'bg-amber-50 border-amber-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{t('au.yourScore')}</p>
            <p className="text-5xl font-bold text-slate-900">{result.total}</p>
            <p className={`text-sm font-semibold mt-2 ${result.passesThreshold ? 'text-green-700' : 'text-red-600'}`}>
              {result.passesThreshold ? `✅ ${t('au.passesTest')} (65+)` : `❌ ${t('au.failsTest')} (需要 65+)`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">{t('au.recentCutoff')} ({lastCutoff.date})</p>
            <p className="text-2xl font-bold text-slate-700">{lastCutoff.score}</p>
            <p className={`text-sm font-semibold mt-1 ${result.total >= lastCutoff.score ? 'text-green-600' : 'text-red-600'}`}>
              {result.total >= lastCutoff.score
                ? `✅ ${t('au.aboveCutoff')} (+${result.total - lastCutoff.score})`
                : `${t('au.belowCutoff')} (−${lastCutoff.score - result.total})`}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
          <ScoreBar value={result.age} max={30} label={t('au.breakdown.age')} />
          <ScoreBar value={result.english} max={20} label={t('au.breakdown.english')} />
          <ScoreBar value={result.overseasWork} max={15} label={t('au.breakdown.overseasWork')} />
          <ScoreBar value={result.australianWork} max={20} label={t('au.breakdown.auWork')} />
          <ScoreBar value={result.education} max={20} label={t('au.breakdown.education')} />
          <ScoreBar value={result.other} max={50} label={t('au.breakdown.other')} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Core */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">1️⃣ {t('au.section.core')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('au.field.age')}</label>
              <input type="number" min={17} max={65} value={input.age}
                onChange={e => set('age', Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-24" />
              <p className="text-xs text-slate-400 mt-1">{t('au.field.ageHint')}</p>
            </div>
            <SelectField label={t('au.field.english')} value={input.english}
              options={engOptions}
              renderOption={v => t(`au.english.${v}`)}
              onChange={v => set('english', v)} />
            <SelectField label={t('au.field.education')} value={input.education}
              options={eduOptions}
              renderOption={v => t(`au.edu.${v}`)}
              onChange={v => set('education', v)} />
          </div>
        </div>

        {/* Work experience */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">2️⃣ {t('au.section.work')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField label={t('au.field.overseasWork')} value={input.overseasWorkExp}
              options={overseasOptions} renderOption={expYearLabel}
              onChange={v => set('overseasWorkExp', v)} />
            <SelectField label={t('au.field.auWork')} value={input.australianWorkExp}
              options={auOptions} renderOption={expYearLabel}
              onChange={v => set('australianWorkExp', v)} />
          </div>
        </div>

        {/* Other factors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">3️⃣ {t('au.section.other')}</h2>
          <div className="space-y-3">
            <Toggle label={t('au.other.australianStudy')} hint={t('au.other.australianStudyHint')}
              checked={input.australianStudy} onChange={v => set('australianStudy', v)} />
            <Toggle label={t('au.other.specialistEdu')} hint={t('au.other.specialistEduHint')}
              checked={input.specialistEducation} onChange={v => set('specialistEducation', v)} />
            <Toggle label={t('au.other.partnerSkills')} hint={t('au.other.partnerSkillsHint')}
              checked={input.partnerSkills} onChange={v => set('partnerSkills', v)} />
            {!input.partnerSkills && (
              <Toggle label={t('au.other.partnerEnglish')} hint={t('au.other.partnerEnglishHint')}
                checked={input.partnerEnglishCompetent} onChange={v => set('partnerEnglishCompetent', v)} />
            )}
            <Toggle label={t('au.other.stateNomination')} hint={t('au.other.stateNominationHint')}
              checked={input.stateNomination} onChange={v => set('stateNomination', v)} />
            <Toggle label={t('au.other.regionalSponsorship')} hint={t('au.other.regionalSponsorshipHint')}
              checked={input.regionalSponsorship} onChange={v => set('regionalSponsorship', v)} />
            <Toggle label={t('au.other.communityLanguage')} hint={t('au.other.communityLanguageHint')}
              checked={input.communityLanguage} onChange={v => set('communityLanguage', v)} />
            <Toggle label={t('au.other.studyInRegional')} hint={t('au.other.studyInRegionalHint')}
              checked={input.studyInRegional} onChange={v => set('studyInRegional', v)} />
            <Toggle label={t('au.other.professionalYear')} hint={t('au.other.professionalYearHint')}
              checked={input.professionalYear} onChange={v => set('professionalYear', v)} />
          </div>
        </div>

        {/* Cutoff history */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">📊 {t('au.cutoffHistory')}</h2>
          <div className="flex flex-wrap gap-2">
            {RECENT_AU_CUTOFFS.map(c => (
              <div key={c.date} className={`rounded-lg px-3 py-2 text-xs border ${
                result.total >= c.score ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-slate-400">{c.date} ({c.visa})</p>
                <p className="font-semibold text-slate-700">{c.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('au.disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}

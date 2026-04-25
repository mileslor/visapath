import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SrtInput } from '../../lib/hmrc/types'
import { calculateSrt } from '../../lib/hmrc/srt'

const DEFAULT_INPUT: SrtInput = {
  ukDaysThisYear: 0,
  ukDaysPrior3Years: 0,
  residentPrior3Years: 0,
  tieFamily: false,
  tieAccommodation: false,
  tieWork: false,
  tieUkDays: false,
  tieActivePriorYear: false,
  diedInYear: false,
  splitYear: false,
}

function NumberInput({ label, hint, value, onChange, min = 0, max }: {
  label: string; hint?: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Math.max(min, Math.min(max ?? 999, Number(e.target.value))))}
        className="w-32 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
  )
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-400 cursor-pointer flex-shrink-0"
      />
      <div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 select-none">{label}</span>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  )
}

export default function HmrcPage() {
  const { t } = useTranslation()
  const [input, setInput] = useState<SrtInput>(DEFAULT_INPUT)

  function set<K extends keyof SrtInput>(key: K, value: SrtInput[K]) {
    setInput(prev => ({ ...prev, [key]: value }))
  }

  const result = useMemo(() => calculateSrt(input), [input])

  const isResident = result.result === 'uk_resident'
  const isNonResident = result.result === 'non_resident'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          📊 {t('hmrc.title')}
        </h1>
        <p className="text-slate-500 text-sm">{t('hmrc.subtitle')}</p>
      </div>

      {/* Result banner — always visible */}
      <div className={`rounded-2xl border p-5 mb-6 ${
        isResident ? 'bg-blue-50 border-blue-200' :
        isNonResident ? 'bg-emerald-50 border-emerald-200' :
        'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{isResident ? '🏠' : isNonResident ? '✈️' : '❓'}</span>
          <div>
            <p className={`text-lg font-bold ${isResident ? 'text-blue-800' : isNonResident ? 'text-emerald-800' : 'text-slate-600'}`}>
              {isResident ? t('hmrc.result.resident') : isNonResident ? t('hmrc.result.nonResident') : t('hmrc.result.unknown')}
            </p>
            <p className="text-sm text-slate-600 mt-0.5">{t(result.reason)}</p>
            {result.reasonDetail && (
              <p className="text-xs text-slate-500 mt-0.5">{t(result.reasonDetail)}</p>
            )}
          </div>
        </div>
        {result.sufficientTiesApplied && (
          <p className="text-xs text-slate-500 mt-3">
            {t('hmrc.srt.tiesCount')}: <span className="font-semibold">{result.tiesCount}</span> / 5
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Section 1: Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">1️⃣ {t('hmrc.section.days')}</h2>
          <div className="space-y-4">
            <NumberInput
              label={t('hmrc.field.ukDaysThisYear')}
              hint={t('hmrc.field.ukDaysThisYearHint')}
              value={input.ukDaysThisYear}
              max={366}
              onChange={v => set('ukDaysThisYear', v)}
            />
            <NumberInput
              label={t('hmrc.field.residentPrior3Years')}
              hint={t('hmrc.field.residentPrior3YearsHint')}
              value={input.residentPrior3Years}
              max={3}
              onChange={v => set('residentPrior3Years', v)}
            />
          </div>
        </div>

        {/* Section 2: UK Ties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-1">2️⃣ {t('hmrc.section.ties')}</h2>
          <p className="text-xs text-slate-400 mb-4">{t('hmrc.section.tiesHint')}</p>
          <div className="space-y-4">
            <Toggle
              label={t('hmrc.tie.family')}
              hint={t('hmrc.tie.familyHint')}
              checked={input.tieFamily}
              onChange={v => set('tieFamily', v)}
            />
            <Toggle
              label={t('hmrc.tie.accommodation')}
              hint={t('hmrc.tie.accommodationHint')}
              checked={input.tieAccommodation}
              onChange={v => set('tieAccommodation', v)}
            />
            <Toggle
              label={t('hmrc.tie.work')}
              hint={t('hmrc.tie.workHint')}
              checked={input.tieWork}
              onChange={v => set('tieWork', v)}
            />
            <Toggle
              label={t('hmrc.tie.ukDays')}
              hint={t('hmrc.tie.ukDaysHint')}
              checked={input.tieUkDays}
              onChange={v => set('tieUkDays', v)}
            />
            <Toggle
              label={t('hmrc.tie.activePriorYear')}
              hint={t('hmrc.tie.activePriorYearHint')}
              checked={input.tieActivePriorYear}
              onChange={v => set('tieActivePriorYear', v)}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
          <p className="text-xs text-amber-800">⚠️ {t('hmrc.disclaimer')}</p>
          <a
            href="https://www.gov.uk/hmrc-internal-manuals/residence-domicile-and-remittance-basis/rdrm11000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
          >
            {t('hmrc.guideLink')} ↗
          </a>
        </div>
      </div>
    </div>
  )
}

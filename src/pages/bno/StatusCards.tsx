import { useTranslation } from 'react-i18next'
import type { BnoCalculation } from '../../lib/bno/types'
import { formatDate } from '../../lib/bno/calculator'

interface Props {
  calc: BnoCalculation
}

function ProgressBar({ value, max, danger }: { value: number; max: number; danger: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = value > max ? 'bg-red-500' : value > danger ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function CountdownBadge({ days, isEligible, t }: { days: number; isEligible: boolean; t: (key: string) => string }) {
  if (isEligible) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
        ✅ {t('bno.ilr.alreadyEligible')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
      ⏳ {days} {t('bno.ilr.daysLeft')}
    </span>
  )
}

export default function StatusCards({ calc }: Props) {
  const { t, i18n } = useTranslation()
  const { ilr, citizenship } = calc

  return (
    <div className="space-y-4">
      {/* ILR Card */}
      <div className={`rounded-2xl border p-5 ${
        ilr.violations.length > 0
          ? 'border-red-200 bg-red-50'
          : ilr.isEligible
          ? 'border-green-200 bg-green-50'
          : 'border-blue-200 bg-white'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{t('bno.ilr.title')}</h3>
            <p className="text-xs text-slate-500">{t('bno.ilr.subtitle')}</p>
          </div>
          <span className="text-2xl">{ilr.isEligible ? '🏡' : '📋'}</span>
        </div>

        <div className="mb-4">
          <CountdownBadge days={ilr.daysUntilEligible} isEligible={ilr.isEligible} t={t} />
          {!ilr.isEligible && (
            <p className="text-xs text-slate-500 mt-2">
              {t('bno.ilr.eligibleOn')}: <strong>{formatDate(ilr.eligibleDate.toISOString().split('T')[0], i18n.language)}</strong>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.ilr.maxPeriod')}</span>
              <span className={`text-xs font-semibold ${
                ilr.maxAbsenceInAnyPeriod > 180 ? 'text-red-600' :
                ilr.maxAbsenceInAnyPeriod > 150 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {ilr.maxAbsenceInAnyPeriod} / 180 {t('bno.days')}
              </span>
            </div>
            <ProgressBar value={ilr.maxAbsenceInAnyPeriod} max={180} danger={150} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.ilr.totalAbsence')}</span>
              <span className="text-xs font-semibold text-slate-700">
                {ilr.totalAbsenceDays} {t('bno.days')}
              </span>
            </div>
          </div>
        </div>

        {ilr.violations.length > 0 && (
          <div className="mt-3 p-3 bg-red-100 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-1">⚠️ {t('bno.ilr.exceeded')}</p>
            {ilr.violations.slice(0, 3).map((v, i) => (
              <p key={i} className="text-xs text-red-600">
                {v.periodStart} → {v.periodEnd}: {v.absenceDays} {t('bno.days')} (+{v.overBy})
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Citizenship Card */}
      <div className={`rounded-2xl border p-5 ${
        citizenship.isEligible
          ? 'border-green-200 bg-green-50'
          : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{t('bno.citizenship.title')}</h3>
            <p className="text-xs text-slate-500">{t('bno.citizenship.subtitle')}</p>
          </div>
          <span className="text-2xl">{citizenship.isEligible ? '🇬🇧' : '📅'}</span>
        </div>

        <div className="mb-4">
          <CountdownBadge days={citizenship.daysUntilEligible} isEligible={citizenship.isEligible} t={t} />
          {!citizenship.isEligible && (
            <p className="text-xs text-slate-500 mt-2">
              {t('bno.citizenship.eligibleOn')}: <strong>{formatDate(citizenship.eligibleDate.toISOString().split('T')[0], i18n.language)}</strong>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.citizenship.last12months')}</span>
              <span className={`text-xs font-semibold ${
                citizenship.absenceLast12Months > 90 ? 'text-red-600' :
                citizenship.absenceLast12Months > 70 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {citizenship.absenceLast12Months} / 90 {t('bno.days')}
              </span>
            </div>
            <ProgressBar value={citizenship.absenceLast12Months} max={90} danger={70} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.citizenship.last5years')}</span>
              <span className={`text-xs font-semibold ${
                citizenship.absenceLast5Years > 450 ? 'text-red-600' :
                citizenship.absenceLast5Years > 360 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {citizenship.absenceLast5Years} / 450 {t('bno.days')}
              </span>
            </div>
            <ProgressBar value={citizenship.absenceLast5Years} max={450} danger={360} />
          </div>
        </div>
      </div>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { subYears, subDays, isAfter } from 'date-fns'
import type { BnoCalculation } from '../../lib/bno/types'
import { formatDate } from '../../lib/bno/calculator'
import { downloadIcs, downloadMultipleIcs } from '../../lib/ics'

interface Props {
  calc: BnoCalculation
}

function ProgressBar({ value, max, danger }: { value: number; max: number; danger: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = value > max ? 'bg-red-500' : value > danger ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function CountdownBadge({ days, isEligible, t }: { days: number; isEligible: boolean; t: (k: string) => string }) {
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

function BudgetChip({ used, limit, label, t }: { used: number; limit: number; label: string; t: (k: string) => string }) {
  const remaining = limit - used
  const isOver = remaining < 0
  const isWarn = !isOver && remaining < limit * 0.15
  return (
    <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
      isOver ? 'bg-red-50 border-red-200' :
      isWarn ? 'bg-amber-50 border-amber-200' :
      'bg-emerald-50 border-emerald-200'
    }`}>
      <span className="text-xs text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${
        isOver ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-emerald-700'
      }`}>
        {isOver ? '⚠️' : '✈️'} {isOver
          ? `${t('bno.budget.over')} ${Math.abs(remaining)} ${t('bno.days')}`
          : `${t('bno.budget.remaining')} ${remaining} ${t('bno.days')}`
        }
      </span>
    </div>
  )
}

function CalBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200"
    >
      📅 {label}
    </button>
  )
}

export default function StatusCards({ calc }: Props) {
  const { t, i18n } = useTranslation()
  const { ilr, citizenship } = calc

  const lang = i18n.language

  // B1 exam prep date = ILR eligible date - 2 years
  const isIlrDelayed = isAfter(ilr.actualEligibleDate, ilr.eligibleDate)
  const b1PrepDate = subYears(ilr.actualEligibleDate, 2)
  const b1DateStr = b1PrepDate.toISOString().split('T')[0]
  const ilrDateStr = ilr.earliestApplicationDate.toISOString().split('T')[0]
  const ilrOriginalDateStr = subDays(ilr.eligibleDate, 28).toISOString().split('T')[0]
  const citizenshipDateStr = citizenship.actualEligibleDate.toISOString().split('T')[0]
  const citizenshipBaseDateStr = citizenship.eligibleDate.toISOString().split('T')[0]

  function addB1Cal() {
    downloadIcs({
      uid: 'bno-b1-prep',
      date: b1DateStr,
      summary: lang === 'zh-HK' ? '開始準備 B1 英語考試 / Life in the UK Test' : 'Start B1 English Test Preparation',
      description: lang === 'zh-HK'
        ? `距離 ILR 申請日期 2 年，建議開始準備英語 B1 考試及英國生活知識測試 (Life in the UK Test)。\nILR 最早申請日：${formatDate(ilrDateStr, lang)}`
        : `2 years before your ILR application date. Recommended time to start B1 English test and Life in the UK Test preparation.\nEarliest ILR application: ${formatDate(ilrDateStr, lang)}`,
    })
  }

  function addIlrCal() {
    downloadIcs({
      uid: 'bno-ilr-apply',
      date: ilrDateStr,
      summary: lang === 'zh-HK' ? 'ILR 永居申請視窗開始' : 'ILR Application Window Opens',
      description: lang === 'zh-HK'
        ? `最早可遞交 ILR（永久居留）申請（5年資格日前28日）。\n5年資格達到日：${formatDate(ilr.eligibleDate.toISOString().split('T')[0], lang)}`
        : `Earliest date to submit your ILR (Indefinite Leave to Remain) application (28 days before the 5-year qualifying date).\n5-year qualifying date: ${formatDate(ilr.eligibleDate.toISOString().split('T')[0], lang)}`,
    })
  }

  function addCitizenshipCal() {
    downloadIcs({
      uid: 'bno-citizenship-apply',
      date: citizenshipDateStr,
      summary: lang === 'zh-HK' ? '英國入籍申請資格日' : 'British Citizenship Eligibility Date',
      description: lang === 'zh-HK'
        ? `可申請英國入籍（歸化）。需已持有 ILR 滿 1 年，且符合離境要求。`
        : `Eligible to apply for British citizenship (naturalisation). You must have held ILR for 1 year and meet the absence requirements.`,
    })
  }

  function addAllCal() {
    downloadMultipleIcs([
      {
        uid: 'bno-b1-prep',
        date: b1DateStr,
        summary: lang === 'zh-HK' ? '開始準備 B1 英語考試 / Life in the UK Test' : 'Start B1 English Test Preparation',
        description: lang === 'zh-HK'
          ? `距離 ILR 申請日期 2 年，建議開始準備英語 B1 考試及英國生活知識測試。\nILR 最早申請日：${formatDate(ilrDateStr, lang)}`
          : `2 years before your ILR application date. Start B1 English test and Life in the UK Test preparation.\nEarliest ILR application: ${formatDate(ilrDateStr, lang)}`,
      },
      {
        uid: 'bno-ilr-apply',
        date: ilrDateStr,
        summary: lang === 'zh-HK' ? 'ILR 永居申請視窗開始' : 'ILR Application Window Opens',
        description: lang === 'zh-HK'
          ? `最早可遞交 ILR 申請（5年資格日前28日）。\n5年資格日：${formatDate(ilr.eligibleDate.toISOString().split('T')[0], lang)}`
          : `Earliest ILR application date (28 days before qualifying date).\n5-year qualifying date: ${formatDate(ilr.eligibleDate.toISOString().split('T')[0], lang)}`,
      },
      {
        uid: 'bno-citizenship-apply',
        date: citizenshipDateStr,
        summary: lang === 'zh-HK' ? '英國入籍申請資格日' : 'British Citizenship Eligibility Date',
        description: lang === 'zh-HK'
          ? `可申請英國入籍（歸化）。需已持有 ILR 滿 1 年，且符合離境要求。`
          : `Eligible to apply for British citizenship (naturalisation). Must have held ILR for 1 year and meet absence requirements.`,
      },
    ], 'bno-milestones.ics')
  }

  return (
    <div className="space-y-4">
      {/* Add all milestones to calendar */}
      <button
        onClick={addAllCal}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-700 transition-colors"
      >
        📅 {t('bno.cal.addAll')}
      </button>

      {/* ILR Card */}
      <div className={`rounded-2xl border p-5 ${
        ilr.violations.length > 0 ? 'border-red-200 bg-red-50' :
        ilr.isEligible ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-white'
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
          <div className="mt-3 space-y-2">
            {/* B1 + ILR apply — side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/60 rounded-lg px-2.5 py-2 border border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-0.5">{t('bno.ilr.b1Prep')}</p>
                <p className="text-xs text-slate-500 mb-1.5">{formatDate(b1DateStr, lang)}</p>
                <CalBtn onClick={addB1Cal} label={t('bno.cal.add')} />
              </div>
              <div className="bg-blue-50/60 rounded-lg px-2.5 py-2 border border-blue-100">
                <p className="text-xs font-medium text-blue-700 mb-0.5">{t('bno.ilr.earliestApply')}</p>
                <p className="text-xs text-blue-600 mb-1.5">
                  {formatDate(ilrDateStr, lang)}
                  <span className="text-slate-400 ml-1">-28{t('bno.days')}</span>
                </p>
                {isIlrDelayed && (
                  <p className="text-xs text-red-400 line-through mb-1">{formatDate(ilrOriginalDateStr, lang)}</p>
                )}
                <CalBtn onClick={addIlrCal} label={t('bno.cal.add')} />
              </div>
            </div>
            {isIlrDelayed && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ {t('bno.ilr.delayed')}
              </p>
            )}
            <div className="text-xs text-slate-400 px-0.5 space-y-0.5">
              <p>{t('bno.ilr.qualifyingDate')}: {formatDate(ilr.eligibleDate.toISOString().split('T')[0], lang)}</p>
              {ilr.qualifyingStartIsApproval && (
                <p className="text-blue-500">
                  ⓘ {t('bno.ilr.clockFromApproval')}
                  {ilr.preArrivalDays > 0 && ` (+${ilr.preArrivalDays} ${t('bno.days')} ${t('bno.ilr.preArrivalAbsence')})`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Budget chips */}
          <BudgetChip
            used={ilr.currentRolling12mAbsence}
            limit={180}
            label={t('bno.budget.ilr12m')}
            t={t}
          />

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
        citizenship.isEligible ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
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
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between gap-2 bg-white/60 rounded-lg px-3 py-2 border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-600">{t('bno.citizenship.eligibleOn')}</p>
                <p className="text-xs text-slate-600">{formatDate(citizenshipDateStr, lang)}</p>
                {citizenship.isDelayed && (
                  <p className="text-xs text-slate-400 mt-0.5 line-through">{formatDate(citizenshipBaseDateStr, lang)}</p>
                )}
              </div>
              <CalBtn onClick={addCitizenshipCal} label={t('bno.cal.add')} />
            </div>
            {citizenship.isDelayed && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ {t('bno.citizenship.delayed')}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Budget chips */}
          <BudgetChip
            used={citizenship.absenceLast12Months}
            limit={90}
            label={t('bno.budget.citizen12m')}
            t={t}
          />
          <BudgetChip
            used={citizenship.absenceLast5Years}
            limit={450}
            label={t('bno.budget.citizen5y')}
            t={t}
          />

          {/* Projected values at application date — always shown as primary */}
          <p className="text-xs text-slate-400">
            📊 {t('bno.citizenship.projectedAsOf')} {formatDate(citizenshipDateStr, lang)}
          </p>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.citizenship.projected12months')}</span>
              <span className={`text-xs font-semibold ${
                citizenship.projectedAbsenceLast12 > 90 ? 'text-red-600' :
                citizenship.projectedAbsenceLast12 > 70 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {citizenship.projectedAbsenceLast12} / 90 {t('bno.days')}
              </span>
            </div>
            <ProgressBar value={citizenship.projectedAbsenceLast12} max={90} danger={70} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600">{t('bno.citizenship.projected5years')}</span>
              <span className={`text-xs font-semibold ${
                citizenship.projectedAbsenceLast5 > 450 ? 'text-red-600' :
                citizenship.projectedAbsenceLast5 > 360 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {citizenship.projectedAbsenceLast5} / 450 {t('bno.days')}
              </span>
            </div>
            <ProgressBar value={citizenship.projectedAbsenceLast5} max={450} danger={360} />
          </div>

          {/* Today's rolling values — secondary reference */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-xs text-slate-400">{t('bno.citizenship.todayRef')}</p>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">{t('bno.citizenship.last12months')}</span>
                <span className={`text-xs font-semibold ${
                  citizenship.absenceLast12Months > 90 ? 'text-red-400' :
                  citizenship.absenceLast12Months > 70 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {citizenship.absenceLast12Months} / 90 {t('bno.days')}
                </span>
              </div>
              <ProgressBar value={citizenship.absenceLast12Months} max={90} danger={70} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">{t('bno.citizenship.last5years')}</span>
                <span className={`text-xs font-semibold ${
                  citizenship.absenceLast5Years > 450 ? 'text-red-400' :
                  citizenship.absenceLast5Years > 360 ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {citizenship.absenceLast5Years} / 450 {t('bno.days')}
                </span>
              </div>
              <ProgressBar value={citizenship.absenceLast5Years} max={450} danger={360} />
            </div>
            {citizenship.absenceLast12Months > 90 && !citizenship.isDelayed && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                ℹ️ {t('bno.citizenship.todayOverLimitNote')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

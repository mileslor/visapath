import { useTranslation } from 'react-i18next'
import type { BnoCalculation } from '../../lib/bno/types'
import { formatDate } from '../../lib/bno/calculator'

interface Props {
  calc: BnoCalculation
}

function MilestoneCard({
  icon, label, days, dateStr, isEligible, color, lang,
}: {
  icon: string; label: string; days: number; dateStr: string; isEligible: boolean;
  color: string; lang: string
}) {
  const { t } = useTranslation()
  return (
    <div className={`flex-1 min-w-0 rounded-xl border px-4 py-3 ${color}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium text-slate-600 truncate">{label}</span>
      </div>
      {isEligible ? (
        <p className="text-sm font-bold text-green-700">✅ {t('bno.ilr.alreadyEligible')}</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900 leading-tight">{days.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{t('bno.milestoneRibbon.daysLeft')}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{formatDate(dateStr, lang)}</p>
        </>
      )}
    </div>
  )
}

export default function MilestoneRibbon({ calc }: Props) {
  const { t, i18n } = useTranslation()
  const { ilr, citizenship } = calc
  const lang = i18n.language

  const ilrDateStr = ilr.earliestApplicationDate.toISOString().split('T')[0]
  const citizenshipDateStr = citizenship.actualEligibleDate.toISOString().split('T')[0]

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
        {t('bno.milestoneRibbon.title')}
      </p>
      <div className="flex gap-3">
        <MilestoneCard
          icon="🏡"
          label={t('bno.ilr.title')}
          days={ilr.daysUntilEligible}
          dateStr={ilrDateStr}
          isEligible={ilr.isEligible}
          color="border-blue-200 bg-blue-50"
          lang={lang}
        />
        <MilestoneCard
          icon="🇬🇧"
          label={t('bno.citizenship.title')}
          days={citizenship.daysUntilEligible}
          dateStr={citizenshipDateStr}
          isEligible={citizenship.isEligible}
          color="border-violet-200 bg-violet-50"
          lang={lang}
        />
      </div>
    </div>
  )
}

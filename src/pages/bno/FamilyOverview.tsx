import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProfileStore } from '../../lib/bno/types'
import { calculate, formatDate } from '../../lib/bno/calculator'

interface Props {
  store: ProfileStore
  activeId: string
  onSwitch: (id: string) => void
}

function StatusDot({ days, isEligible }: { days: number; isEligible: boolean }) {
  if (isEligible) return <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
  if (days < 365) return <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
  return <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
}

export default function FamilyOverview({ store, activeId, onSwitch }: Props) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const lang = i18n.language

  const profiles = useMemo(() => Object.values(store.profiles), [store.profiles])

  const rows = useMemo(() => profiles.map(p => {
    if (!p.data.arrivalDate) return { profile: p, calc: null }
    try {
      const calc = calculate(p.data.arrivalDate, p.data.trips, { horizonMonths: 0 }, p.data.approvalDate, p.data.isLOTR)
      return { profile: p, calc }
    } catch {
      return { profile: p, calc: null }
    }
  }), [profiles])

  if (profiles.length <= 1) return null

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors bg-white"
      >
        <span className="text-sm font-semibold text-slate-800">👨‍👩‍👧 {t('bno.family.title')} ({profiles.length})</span>
        <span className="text-slate-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 w-32">{t('bno.family.member')}</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">{t('bno.ilr.title')}</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">{t('bno.citizenship.title')}</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">{t('bno.family.ilrBudget')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ profile, calc }) => (
                  <tr
                    key={profile.id}
                    onClick={() => onSwitch(profile.id)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${
                      profile.id === activeId ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-800 text-sm truncate block max-w-[120px]">
                        {profile.id === activeId && <span className="text-blue-500 mr-1">▶</span>}
                        {profile.name}
                      </span>
                    </td>
                    {calc ? (
                      <>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <StatusDot days={calc.ilr.daysUntilEligible} isEligible={calc.ilr.isEligible} />
                            <span className="text-xs text-slate-600">
                              {calc.ilr.isEligible
                                ? t('bno.ilr.alreadyEligible')
                                : `${calc.ilr.daysUntilEligible}${t('bno.days')}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(calc.ilr.earliestApplicationDate.toISOString().split('T')[0], lang)}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <StatusDot days={calc.citizenship.daysUntilEligible} isEligible={calc.citizenship.isEligible} />
                            <span className="text-xs text-slate-600">
                              {calc.citizenship.isEligible
                                ? t('bno.citizenship.alreadyEligible')
                                : `${calc.citizenship.daysUntilEligible}${t('bno.days')}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(calc.citizenship.actualEligibleDate.toISOString().split('T')[0], lang)}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-semibold ${
                            180 - calc.ilr.currentRolling12mAbsence < 0 ? 'text-red-600' :
                            180 - calc.ilr.currentRolling12mAbsence < 30 ? 'text-amber-600' :
                            'text-emerald-700'
                          }`}>
                            {Math.max(0, 180 - calc.ilr.currentRolling12mAbsence)}{t('bno.days')}
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan={3} className="px-3 py-3 text-xs text-slate-400">
                        {t('bno.family.noData')}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

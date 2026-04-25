import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { differenceInDays, parseISO } from 'date-fns'
import type { Trip, BnoCalculation } from '../../lib/bno/types'
import { calculate } from '../../lib/bno/calculator'
import type { BnoData } from '../../lib/bno/types'

interface Props {
  data: BnoData
  currentCalc: BnoCalculation
}

export default function WhatIfSimulator({ data, currentCalc }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [departure, setDeparture] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const simCalc = useMemo(() => {
    if (!departure || !returnDate || !data.arrivalDate) return null
    if (departure >= returnDate) return null
    const simTrip: Trip = {
      id: '__whatif__',
      departureDate: departure,
      returnDate,
    }
    try {
      return calculate(
        data.arrivalDate,
        [...data.trips, simTrip],
        { horizonMonths: 0 },
        data.approvalDate,
        data.isLOTR,
      )
    } catch {
      return null
    }
  }, [departure, returnDate, data])

  const tripDays = departure && returnDate && returnDate > departure
    ? Math.max(0, differenceInDays(parseISO(returnDate), parseISO(departure)) - 1)
    : null

  function Delta({ before, after, limit, label }: { before: number; after: number; limit: number; label: string }) {
    const delta = after - before
    const isOver = after > limit
    const wasOver = before > limit
    return (
      <div className={`rounded-lg px-3 py-2 border text-xs ${
        isOver && !wasOver ? 'bg-red-50 border-red-200' :
        isOver ? 'bg-red-50 border-red-200' :
        delta > 0 ? 'bg-amber-50 border-amber-200' :
        'bg-emerald-50 border-emerald-200'
      }`}>
        <p className="text-slate-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{before} → <span className={isOver ? 'text-red-600' : delta > 0 ? 'text-amber-700' : 'text-slate-700'}>{after}</span> / {limit} {t('bno.days')}</span>
          {delta !== 0 && (
            <span className={`font-bold ${delta > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          {isOver && <span className="text-red-600 font-semibold">{t('bno.ilr.exceeded')}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-violet-100 transition-colors"
      >
        <span className="text-sm font-semibold text-violet-800">🧮 {t('bno.whatif.title')}</span>
        <span className="text-violet-500 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <p className="text-xs text-violet-600">{t('bno.whatif.desc')}</p>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                {t('bno.departure')}
              </label>
              <input
                type="date"
                value={departure}
                onChange={e => setDeparture(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
            </div>
            <div className="text-slate-300 text-lg self-center pb-1">→</div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                {t('bno.return')}
              </label>
              <input
                type="date"
                value={returnDate}
                min={departure || undefined}
                onChange={e => setReturnDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              />
            </div>
            {tripDays !== null && (
              <div className="text-sm font-medium text-violet-700 bg-violet-100 rounded-lg px-3 py-2 self-end">
                ✈️ {tripDays} {t('bno.days')} {t('bno.whatif.absence')}
              </div>
            )}
          </div>

          {simCalc && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t('bno.whatif.impact')}</p>
              <Delta
                before={currentCalc.ilr.currentRolling12mAbsence}
                after={simCalc.ilr.currentRolling12mAbsence}
                limit={180}
                label={t('bno.budget.ilr12m')}
              />
              <Delta
                before={currentCalc.citizenship.absenceLast12Months}
                after={simCalc.citizenship.absenceLast12Months}
                limit={90}
                label={t('bno.budget.citizen12m')}
              />
              <Delta
                before={currentCalc.citizenship.absenceLast5Years}
                after={simCalc.citizenship.absenceLast5Years}
                limit={450}
                label={t('bno.budget.citizen5y')}
              />
              {simCalc.ilr.daysUntilEligible !== currentCalc.ilr.daysUntilEligible && (
                <div className="rounded-lg px-3 py-2 border border-red-200 bg-red-50 text-xs">
                  <p className="text-slate-500 mb-0.5">{t('bno.whatif.ilrImpact')}</p>
                  <p className="font-semibold text-red-700">
                    {t('bno.whatif.ilrPushed')} +{simCalc.ilr.daysUntilEligible - currentCalc.ilr.daysUntilEligible} {t('bno.days')}
                  </p>
                </div>
              )}
              {simCalc.citizenship.daysUntilEligible !== currentCalc.citizenship.daysUntilEligible && (
                <div className="rounded-lg px-3 py-2 border border-red-200 bg-red-50 text-xs">
                  <p className="text-slate-500 mb-0.5">{t('bno.whatif.citizenImpact')}</p>
                  <p className="font-semibold text-red-700">
                    {t('bno.whatif.citizenPushed')} +{simCalc.citizenship.daysUntilEligible - currentCalc.citizenship.daysUntilEligible} {t('bno.days')}
                  </p>
                </div>
              )}
              {simCalc.ilr.daysUntilEligible === currentCalc.ilr.daysUntilEligible &&
               simCalc.citizenship.daysUntilEligible === currentCalc.citizenship.daysUntilEligible && (
                <div className="rounded-lg px-3 py-2 border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 font-medium">
                  ✅ {t('bno.whatif.noImpact')}
                </div>
              )}
            </div>
          )}

          {departure && returnDate && departure >= returnDate && (
            <p className="text-xs text-red-500">{t('bno.whatif.dateError')}</p>
          )}
        </div>
      )}
    </div>
  )
}

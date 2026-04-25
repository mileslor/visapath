import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { differenceInDays, parseISO } from 'date-fns'
import type { Trip } from '../../lib/bno/types'
import { todayISO, addDaysToISO, formatDate } from '../../lib/bno/calculator'

interface Props {
  initial?: Trip
  onSave: (trip: Omit<Trip, 'id'>) => void
  onCancel: () => void
}

export default function TripForm({ initial, onSave, onCancel }: Props) {
  const { t, i18n } = useTranslation()
  const [departure, setDeparture] = useState(initial?.departureDate ?? '')
  const [returnDate, setReturnDate] = useState(initial?.returnDate ?? '')
  const [destination, setDestination] = useState(initial?.destination ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      setDeparture(initial.departureDate)
      setReturnDate(initial.returnDate)
      setDestination(initial.destination ?? '')
      setNotes(initial.notes ?? '')
    }
  }, [initial])

  const today = todayISO()

  // Days since departure (for "today" button label)
  const daysSinceDeparture = departure
    ? differenceInDays(parseISO(today), parseISO(departure))
    : null

  // Milestone hints from departure date
  const hint90 = departure ? addDaysToISO(departure, 91) : ''   // 90 absence days = dep+91
  const hint180 = departure ? addDaysToISO(departure, 181) : '' // 180 absence days = dep+181

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!departure || !returnDate) {
      setError('Please fill in both dates.')
      return
    }
    if (returnDate <= departure) {
      setError('Return date must be after departure date.')
      return
    }
    onSave({ departureDate: departure, returnDate, destination, notes })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Departure */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {t('bno.departure')} *
          </label>
          <input
            type="date"
            value={departure}
            max={today}
            onChange={(e) => setDeparture(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            required
          />
          {/* Milestone hints */}
          {departure && (
            <div className="mt-1.5 space-y-0.5">
              <p className="text-xs text-amber-600">
                90日 → {formatDate(hint90, i18n.language)}
              </p>
              <p className="text-xs text-red-500">
                180日 → {formatDate(hint180, i18n.language)}
              </p>
            </div>
          )}
        </div>

        {/* Return */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {t('bno.return')} *
          </label>
          <div className="space-y-1.5">
            <input
              type="date"
              value={returnDate}
              min={departure || undefined}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            {/* Today button — only show if departure is set and not yet returned */}
            {departure && departure < today && (
              <button
                type="button"
                onClick={() => setReturnDate(today)}
                className={`w-full text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                  returnDate === today
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {t('bno.today')}
                {daysSinceDeparture !== null && daysSinceDeparture > 0 && (
                  <span className="ml-1 opacity-75">({daysSinceDeparture})</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {t('bno.destination')}
        </label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Hong Kong"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {t('bno.notes')}
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {t('bno.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('bno.save')}
        </button>
      </div>
    </form>
  )
}

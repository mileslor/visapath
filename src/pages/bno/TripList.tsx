import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Trip } from '../../lib/bno/types'
import { tripAbsenceDays, formatDate } from '../../lib/bno/calculator'
import TripForm from './TripForm'

interface Props {
  trips: Trip[]
  onUpdate: (id: string, data: Omit<Trip, 'id'>) => void
  onDelete: (id: string) => void
}

export default function TripList({ trips, onUpdate, onDelete }: Props) {
  const { t, i18n } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...trips].sort((a, b) => b.departureDate.localeCompare(a.departureDate))

  if (trips.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        {t('bno.noTrips')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((trip) => {
        const absenceDays = tripAbsenceDays(trip)
        const isEditing = editingId === trip.id

        if (isEditing) {
          return (
            <TripForm
              key={trip.id}
              initial={trip}
              onSave={(data) => {
                onUpdate(trip.id, data)
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          )
        }

        return (
          <div
            key={trip.id}
            className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-800">
                  {formatDate(trip.departureDate, i18n.language)} → {formatDate(trip.returnDate, i18n.language)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  absenceDays === 0
                    ? 'bg-slate-100 text-slate-600'
                    : absenceDays >= 150
                    ? 'bg-red-100 text-red-700'
                    : absenceDays >= 100
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {absenceDays} {t('bno.days')}
                </span>
              </div>
              {trip.destination && (
                <p className="text-xs text-slate-500 truncate">
                  📍 {trip.destination}
                  {trip.notes ? ` · ${trip.notes}` : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditingId(trip.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title={t('bno.edit')}
              >
                ✏️
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this record?')) onDelete(trip.id)
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title={t('bno.delete')}
              >
                🗑️
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

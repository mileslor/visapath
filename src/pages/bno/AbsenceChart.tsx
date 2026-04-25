import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseISO, addYears, format, differenceInDays } from 'date-fns'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import type { RollingDataPoint } from '../../lib/bno/types'
import type { ChartOptions } from '../../lib/bno/calculator'

interface Props {
  data: RollingDataPoint[]
  ilrDate: string
  citizenshipDate: string
  chartOpts: ChartOptions
  onOptsChange: (opts: ChartOptions) => void
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    const value = payload[0].value
    const display = label ? label.slice(0, 7) : ''
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs space-y-0.5">
        <p className="text-slate-500">{display}</p>
        <p className={`font-semibold ${value > 180 ? 'text-red-600' : value > 150 ? 'text-amber-600' : 'text-blue-600'}`}>
          {value} {t('bno.days')}
        </p>
      </div>
    )
  }
  return null
}

const HORIZON_OPTIONS = [
  { value: 0,  labelKey: 'bno.chart.horizonNow' },
  { value: 3,  labelKey: 'bno.chart.horizon3' },
  { value: 6,  labelKey: 'bno.chart.horizon6' },
  { value: 12, labelKey: 'bno.chart.horizon12' },
  { value: 18, labelKey: 'bno.chart.horizon18' },
]

export default function AbsenceChart({ data, ilrDate, citizenshipDate, chartOpts, onOptsChange }: Props) {
  const { t } = useTranslation()
  const { horizonMonths } = chartOpts

  // yearPage: null = show all; number = 0-based year index from data start
  const [yearPage, setYearPage] = useState<number | null>(null)

  const { visibleData, maxPage, pageLabel } = useMemo(() => {
    if (data.length === 0) return { visibleData: data, maxPage: 0, pageLabel: '' }
    const firstDate = parseISO(data[0].month)
    const lastDate = parseISO(data[data.length - 1].month)
    const totalDays = differenceInDays(lastDate, firstDate)
    const totalYears = Math.ceil(totalDays / 365)
    const max = Math.max(0, totalYears - 1)

    if (yearPage === null) return { visibleData: data, maxPage: max, pageLabel: '' }

    const pageStart = addYears(firstDate, yearPage)
    const pageEnd = addYears(pageStart, 1)
    const startStr = format(pageStart, 'yyyy-MM-dd')
    const endStr = format(pageEnd, 'yyyy-MM-dd')
    const filtered = data.filter(d => d.month >= startStr && d.month <= endStr)
    const label = `${format(pageStart, 'M/yyyy')} — ${format(pageEnd, 'M/yyyy')}`

    return {
      visibleData: filtered.length > 0 ? filtered : data,
      maxPage: max,
      pageLabel: label,
    }
  }, [data, yearPage])

  // One tick per month, "M/YY" when year changes else "M"
  const { ticks, tickLabels } = useMemo(() => {
    const seen = new Set<string>()
    const ticks: string[] = []
    const tickLabels = new Map<string, string>()
    let prevYear = ''
    for (const pt of visibleData) {
      const ym = pt.month.slice(0, 7)
      if (!seen.has(ym)) {
        seen.add(ym)
        ticks.push(pt.month)
        const year = pt.month.slice(2, 4)
        const month = String(parseInt(pt.month.slice(5, 7)))
        const label = year !== prevYear ? `${month}/${year}` : month
        tickLabels.set(pt.month, label)
        prevYear = year
      }
    }
    return { ticks, tickLabels }
  }, [visibleData])

  if (data.length === 0) return null

  const maxY = Math.max(200, ...visibleData.map(d => d.absenceDays)) + 10
  const inYearView = yearPage !== null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      {/* Header + horizon controls (hidden in year-view mode) */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{t('bno.chart.title')}</h3>
          <p className="text-xs text-slate-400">{t('bno.chart.subtitle')}</p>
        </div>
        {!inYearView && (
          <div className="flex items-center gap-1 text-xs flex-wrap">
            <span className="text-slate-400 mr-1">{t('bno.chart.horizon')}:</span>
            {HORIZON_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onOptsChange({ ...chartOpts, horizonMonths: opt.value })}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  horizonMonths === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Year navigation */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setYearPage(null)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            !inYearView ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t('bno.chart.showAll')}
        </button>
        <button
          onClick={() => setYearPage(p => Math.max(0, (p ?? 0) - 1))}
          disabled={inYearView && yearPage === 0}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
        >
          ◀ {t('bno.chart.prevYear')}
        </button>
        <button
          onClick={() => setYearPage(p => Math.min(maxPage, (p ?? -1) + 1))}
          disabled={inYearView && yearPage === maxPage}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
        >
          {t('bno.chart.nextYear')} ▶
        </button>
        {inYearView && pageLabel && (
          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
            {pageLabel}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={visibleData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="absenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            ticks={ticks}
            tickFormatter={val => tickLabels.get(val) ?? ''}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, maxY]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="4 4"
            label={{ value: '180', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
          <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4"
            label={{ value: '90', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }} />
          <ReferenceLine x={ilrDate} stroke="#6366f1" strokeWidth={1.5}
            label={{ value: 'ILR', position: 'insideTopLeft', fontSize: 9, fill: '#6366f1' }} />
          <ReferenceLine x={citizenshipDate} stroke="#10b981" strokeWidth={1.5}
            label={{ value: '🇬🇧', position: 'insideTopLeft', fontSize: 10 }} />
          <Area type="monotone" dataKey="absenceDays"
            stroke="#3b82f6" strokeWidth={2}
            fill="url(#absenceGrad)" dot={false}
            activeDot={{ r: 4, fill: '#2563eb' }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> {t('bno.chart.absenceDays')}
        </span>
        <span className="text-red-400">── 180 (ILR)</span>
        <span className="text-amber-400">── 90 ({t('bno.chart.citizenship')})</span>
        <span className="text-indigo-400">│ ILR</span>
        <span className="text-emerald-400">│ 🇬🇧</span>
      </div>
    </div>
  )
}

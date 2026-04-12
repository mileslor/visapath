import { useTranslation } from 'react-i18next'
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

interface Props {
  data: RollingDataPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  const { t } = useTranslation()
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow text-xs">
        <p className="text-slate-500 mb-0.5">{label}</p>
        <p className={`font-semibold ${value > 180 ? 'text-red-600' : value > 150 ? 'text-amber-600' : 'text-blue-600'}`}>
          {value} {t('bno.days')}
        </p>
      </div>
    )
  }
  return null
}

export default function AbsenceChart({ data }: Props) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return null
  }

  // Thin out labels if too many data points
  const tickInterval = data.length > 24 ? Math.floor(data.length / 12) : 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 mb-1">{t('bno.chart.title')}</h3>
      <p className="text-xs text-slate-400 mb-4">{t('bno.chart.absenceDays')} (12 {t('bno.chart.month')})</p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="absenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval={tickInterval}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.max(200, ...data.map((d) => d.absenceDays))]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={180}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: '180', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
          />
          <Area
            type="monotone"
            dataKey="absenceDays"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#absenceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> {t('bno.chart.absenceDays')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-400 inline-block rounded border-dashed" /> {t('bno.chart.limit')}
        </span>
      </div>
    </div>
  )
}

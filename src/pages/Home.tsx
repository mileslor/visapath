import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const TOOLS = [
  {
    key: 'bno',
    icon: '🇬🇧',
    path: '/bno',
    color: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
]

const COMING_SOON = [
  { icon: '🇮🇪', label: 'Ireland' },
  { icon: '🇨🇦', label: 'Canada' },
  { icon: '🇦🇺', label: 'Australia' },
]

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-5 shadow-lg">
          <span className="text-3xl">🌐</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">
          {t('home.title')}
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Tools */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
        {t('home.tools')}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {TOOLS.map((tool) => (
          <Link
            key={tool.key}
            to={tool.path}
            className={`group block rounded-2xl border ${tool.borderColor} ${tool.bgLight} p-6 hover:shadow-md transition-all hover:-translate-y-0.5`}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4 shadow`}>
              <span className="text-2xl">{tool.icon}</span>
            </div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-blue-700 transition-colors">
              {t(`home.${tool.key}Card.title`)}
            </h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              {t(`home.${tool.key}Card.desc`)}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              {t(`home.${tool.key}Card.btn`)} →
            </span>
          </Link>
        ))}

        {/* Coming soon placeholders */}
        {COMING_SOON.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 opacity-60"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-200 mb-4">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <h3 className="font-semibold text-slate-500 text-lg mb-1">{item.label}</h3>
            <p className="text-sm text-slate-400">{t('home.comingSoon')}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
        <p className="text-sm text-amber-800">
          ⚠️ {t('home.disclaimer')}
        </p>
      </div>
    </div>
  )
}

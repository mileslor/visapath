import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface ActiveTool {
  key: string
  icon: string
  path: string
  color: string
  bgLight: string
  borderColor: string
  active: true
}

interface ComingSoonTool {
  key: string
  icon: string
  color: string
  active?: false
}

type Tool = ActiveTool | ComingSoonTool

interface CountrySection {
  countryKey: string
  flag: string
  tools: Tool[]
}

const COUNTRIES: CountrySection[] = [
  {
    countryKey: 'uk',
    flag: '🇬🇧',
    tools: [
      {
        key: 'bno',
        icon: '🛂',
        path: '/bno',
        color: 'from-blue-500 to-blue-700',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200',
        active: true,
      },
      {
        key: 'skilledWorker',
        icon: '🏢',
        path: '/skilled-worker',
        color: 'from-violet-500 to-violet-700',
        bgLight: 'bg-violet-50',
        borderColor: 'border-violet-200',
        active: true as const,
      },
      {
        key: 'family',
        icon: '👨‍👩‍👧',
        path: '/family-visa',
        color: 'from-rose-500 to-rose-700',
        bgLight: 'bg-rose-50',
        borderColor: 'border-rose-200',
        active: true as const,
      },
      {
        key: 'student',
        icon: '🎓',
        path: '/uk/student',
        color: 'from-emerald-500 to-emerald-700',
        bgLight: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        active: true as const,
      },
      {
        key: 'hmrc',
        icon: '📊',
        path: '/hmrc',
        color: 'from-amber-500 to-amber-700',
        bgLight: 'bg-amber-50',
        borderColor: 'border-amber-200',
        active: true as const,
      },
    ],
  },
  {
    countryKey: 'canada',
    flag: '🇨🇦',
    tools: [
      {
        key: 'expressEntry',
        icon: '⭐',
        path: '/canada/crs',
        color: 'from-red-500 to-red-700',
        bgLight: 'bg-red-50',
        borderColor: 'border-red-200',
        active: true as const,
      },
      {
        key: 'pnp',
        icon: '🏔️',
        path: '/canada/pnp',
        color: 'from-orange-500 to-orange-700',
        bgLight: 'bg-orange-50',
        borderColor: 'border-orange-200',
        active: true as const,
      },
      {
        key: 'canadaStudent',
        icon: '🎓',
        path: '/canada/student',
        color: 'from-emerald-500 to-emerald-700',
        bgLight: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        active: true as const,
      },
      {
        key: 'rnip',
        icon: '🏘️',
        path: '/canada/rnip',
        color: 'from-rose-600 to-rose-800',
        bgLight: 'bg-rose-50',
        borderColor: 'border-rose-200',
        active: true as const,
      },
    ],
  },
  {
    countryKey: 'australia',
    flag: '🇦🇺',
    tools: [
      {
        key: 'skilled189',
        icon: '⭐',
        path: '/australia/points',
        color: 'from-yellow-500 to-yellow-700',
        bgLight: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        active: true as const,
      },
      {
        key: 'employer186',
        icon: '🏢',
        path: '/australia/186',
        color: 'from-green-500 to-green-700',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        active: true as const,
      },
      {
        key: 'auStudent',
        icon: '🎓',
        path: '/australia/student',
        color: 'from-teal-500 to-teal-700',
        bgLight: 'bg-teal-50',
        borderColor: 'border-teal-200',
        active: true as const,
      },
    ],
  },
  {
    countryKey: 'ireland',
    flag: '🇮🇪',
    tools: [
      {
        key: 'criticalSkills',
        icon: '💼',
        path: '/ireland/critical-skills',
        color: 'from-green-600 to-green-800',
        bgLight: 'bg-green-50',
        borderColor: 'border-green-200',
        active: true as const,
      },
      {
        key: 'stamp4',
        icon: '🗂️',
        path: '/ireland/stamp4',
        color: 'from-lime-500 to-lime-700',
        bgLight: 'bg-lime-50',
        borderColor: 'border-lime-200',
        active: true as const,
      },
    ],
  },
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

      {/* Country sections */}
      <div className="space-y-10 mb-10">
        {COUNTRIES.map((country) => (
          <div key={country.countryKey}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{country.flag}</span>
              <h2 className="text-base font-semibold text-slate-700">
                {t(`home.country.${country.countryKey}`)}
              </h2>
              <div className="flex-1 h-px bg-slate-200 ml-2" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {country.tools.map((tool) =>
                tool.active ? (
                  <Link
                    key={tool.key}
                    to={(tool as ActiveTool).path}
                    className={`group block rounded-2xl border ${(tool as ActiveTool).borderColor} ${(tool as ActiveTool).bgLight} p-6 hover:shadow-md transition-all hover:-translate-y-0.5`}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4 shadow`}>
                      <span className="text-2xl">{tool.icon}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-base mb-1 group-hover:text-blue-700 transition-colors">
                      {t(`home.${tool.key}Card.title`)}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                      {t(`home.${tool.key}Card.desc`)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                      {t(`home.${tool.key}Card.btn`)} →
                    </span>
                  </Link>
                ) : (
                  <div
                    key={tool.key}
                    className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 opacity-50"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} mb-4 opacity-30`}>
                      <span className="text-2xl">{tool.icon}</span>
                    </div>
                    <h3 className="font-semibold text-slate-500 text-base mb-1">
                      {t(`home.${tool.key}Card.title`)}
                    </h3>
                    <p className="text-xs text-slate-400">{t('home.comingSoon')}</p>
                  </div>
                )
              )}
            </div>
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

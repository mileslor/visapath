import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'

const LANGUAGES = [
  { code: 'zh-HK', label: '繁中' },
  { code: 'en', label: 'EN' },
]

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()

  function switchLang(code: string) {
    i18n.changeLanguage(code)
    localStorage.setItem('visapath-lang', code)
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-blue-700 text-lg hover:text-blue-800 transition-colors">
          <span className="text-xl">🌐</span>
          VisaPath
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/bno"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/bno'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('nav.bno')}
          </Link>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden ml-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLang(lang.code)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

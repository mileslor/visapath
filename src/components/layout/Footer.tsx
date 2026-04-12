import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center space-y-2">
        <p className="text-xs text-slate-500 max-w-2xl mx-auto">{t('footer.disclaimer')}</p>
        <p className="text-xs text-slate-400">{t('footer.madeWith')}</p>
      </div>
    </footer>
  )
}

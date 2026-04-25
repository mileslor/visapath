import { useTranslation } from 'react-i18next'

const FEEDBACK_EMAIL = 'info@hkmilestone.com'

export default function Footer() {
  const { t } = useTranslation()
  const mailtoHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t('footer.feedbackSubject'))}`

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center space-y-2">
        <p className="text-xs text-slate-500 max-w-2xl mx-auto">{t('footer.disclaimer')}</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <p className="text-xs text-slate-400">{t('footer.madeWith')}</p>
          <a href={mailtoHref} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors">
            ✉️ {t('footer.feedback')}
          </a>
        </div>
      </div>
    </footer>
  )
}

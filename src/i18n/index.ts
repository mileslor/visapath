import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhHK from './locales/zh-HK.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-HK': { translation: zhHK },
    },
    lng: localStorage.getItem('visapath-lang') || 'zh-HK',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

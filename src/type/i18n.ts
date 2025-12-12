import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationVI from '../../public/locales/vi/translation.json';
import translationEN from '../../public/locales/en/translation.json';

const resources = {
  vi: {
    translation: translationVI,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources, 
    fallbackLng: 'vi',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Remove `navigator` from detection order so server and client
      // render the same default language when no explicit choice exists.
      // This prevents hydration mismatches where server falls back to
      // 'vi' but the client picks the browser language (e.g. 'en').
      order: ['localStorage', 'cookie', 'querystring'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
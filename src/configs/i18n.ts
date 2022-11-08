import i18next from 'i18next';
import { DEFAULT_LOCALE } from '@/helpers/locales';

i18next.init({
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
});

export default i18next;

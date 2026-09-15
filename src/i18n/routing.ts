import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@modules/i18n';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
	defaultLocale: DEFAULT_LOCALE,
	localeCookie: { name: 'NEXT_LOCALE' },
	locales: SUPPORTED_LOCALES,
});

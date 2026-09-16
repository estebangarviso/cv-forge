import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
	const locale = (await requestLocale) ?? routing.defaultLocale;
	const messagesModule = await import(
		`@modules/i18n/messages/${locale}.json`
	);
	const messages = messagesModule.default;
	return { locale, messages };
});

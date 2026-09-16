import type { Metadata } from 'next';

import { Providers } from '@core/providers';
import { isLocale, SUPPORTED_LOCALES } from '@modules/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';

import '../globals.css';

const inter = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-sans',
	weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
	description:
		'CV builder with Google OAuth, Drive storage, and browser-native PDF export',
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
	),
	title: 'CV Studio',
};

export function generateStaticParams() {
	return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
	const { locale } = await params;

	if (!isLocale(locale)) notFound();

	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={inter.variable}>
				<NextIntlClientProvider messages={messages}>
					<Providers>{children}</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

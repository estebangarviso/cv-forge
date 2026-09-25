'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { SUPPORTED_LOCALES } from '@modules/i18n';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/ui';
import { useLocale } from 'next-intl';

const LOCALE_LABELS: Record<string, string> = {
	en: 'English',
	es: 'Español',
};

export function LocaleSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();
	const router = useRouter();

	return (
		<Select
			onValueChange={(nextLocale) => {
				router.replace(pathname, { locale: nextLocale });
			}}
			value={locale}
		>
			<SelectTrigger
				aria-label='Language'
				className='h-9 w-auto gap-1 border-none bg-transparent px-2 text-sm shadow-none focus:ring-0'
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align='end'>
				{SUPPORTED_LOCALES.map((supportedLocale) => (
					<SelectItem key={supportedLocale} value={supportedLocale}>
						{LOCALE_LABELS[supportedLocale]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

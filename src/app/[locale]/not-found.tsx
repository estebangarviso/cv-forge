import { useTranslations } from 'next-intl';

export default function NotFound() {
	const t = useTranslations('common');

	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-24'>
			<h1 className='text-4xl font-bold'>404</h1>
			<p className='mt-4 text-lg text-gray-600'>{t('notFound')}</p>
		</main>
	);
}

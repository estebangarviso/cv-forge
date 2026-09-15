import { useTranslations } from 'next-intl';

export default function LandingPage() {
	const t = useTranslations('login');

	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center text-center'>
			<h1 className='text-4xl font-bold tracking-tight'>{t('title')}</h1>
			<p className='mt-4 max-w-md text-lg text-muted-foreground'>
				{t('description')}
			</p>
		</div>
	);
}

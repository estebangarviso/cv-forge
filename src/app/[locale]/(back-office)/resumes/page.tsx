import { useTranslations } from 'next-intl';

export default function ResumesPage() {
	const t = useTranslations('resumes');

	return (
		<div>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>{t('title')}</h1>
			</div>
			<p className='mt-4 text-muted-foreground'>{t('empty')}</p>
		</div>
	);
}

import { getTranslations } from 'next-intl/server';

const GITHUB_ISSUES_URL = 'https://github.com/estebangarviso/cv-forge/issues';
const LAST_UPDATED = '2026-09-22';

export async function generateMetadata() {
	const t = await getTranslations('terms');
	return { title: `${t('title')} — CV Forge` };
}

export default async function TermsOfServicePage() {
	const t = await getTranslations('terms');

	const sections = [
		'acceptance',
		'serviceDescription',
		'account',
		'acceptableUse',
		'availability',
		'intellectualProperty',
		'liability',
		'termination',
		'changes',
		'governingLaw',
	] as const;

	return (
		<div className='mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>
					{t('title')}
				</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					{t('updated', { date: LAST_UPDATED })}
				</p>
			</div>

			{sections.map((section) => (
				<section key={section}>
					<h2 className='text-xl font-semibold'>
						{t(`${section}.title`)}
					</h2>
					<p className='mt-2 text-muted-foreground'>
						{t(`${section}.body`)}
					</p>
				</section>
			))}

			<section>
				<h2 className='text-xl font-semibold'>{t('contact.title')}</h2>
				<p className='mt-2 text-muted-foreground'>
					{t('contact.body')}{' '}
					<a
						className='text-primary underline underline-offset-4'
						href={GITHUB_ISSUES_URL}
						rel='noopener noreferrer'
						target='_blank'
					>
						{t('contact.linkText')}
					</a>
				</p>
			</section>
		</div>
	);
}

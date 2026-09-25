import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

import { CvIllustration } from './cv-illustration';
import { SignInButton } from './sign-in-button';

export async function generateMetadata() {
	const t = await getTranslations('login');
	return { title: `${t('heading')} — CV Forge` };
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	const t = await getTranslations('login');

	return (
		<div className='grid min-h-[calc(100dvh-4.5rem)] flex-1 lg:grid-cols-[1.08fr_0.92fr]'>
			<div className='hidden items-center justify-center overflow-hidden bg-muted px-8 py-12 lg:flex xl:px-16'>
				<CvIllustration />
			</div>

			<div className='flex flex-col justify-between px-6 py-12 sm:px-12 lg:px-16 xl:px-24'>
				<div className='flex flex-1 items-center'>
					<div className='w-full max-w-sm'>
						<h1 className='text-3xl font-bold tracking-tight'>
							{t('heading')}
						</h1>
						{error === 'AccessDenied' ? (
							<p className='mt-4 text-sm text-destructive'>
								{t('accessDenied')}
							</p>
						) : null}
						<SignInButton />
						<p className='mt-4 text-xs leading-5 text-muted-foreground'>
							{t.rich('consent', {
								privacy: (chunks) => (
									<Link
										className='underline underline-offset-2 hover:text-foreground'
										href='/privacy'
									>
										{chunks}
									</Link>
								),
								terms: (chunks) => (
									<Link
										className='underline underline-offset-2 hover:text-foreground'
										href='/terms'
									>
										{chunks}
									</Link>
								),
							})}
						</p>
					</div>
				</div>
				<nav className='flex items-center gap-4 border-t pt-5 text-xs text-muted-foreground'>
					<Link className='hover:text-foreground' href='/privacy'>
						{t('privacyPolicy')}
					</Link>
					<Link className='hover:text-foreground' href='/terms'>
						{t('termsOfService')}
					</Link>
				</nav>
			</div>
		</div>
	);
}

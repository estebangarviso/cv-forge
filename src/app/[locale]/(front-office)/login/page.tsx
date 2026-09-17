import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import { SignInButton } from './sign-in-button';

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	const t = await getTranslations('login');

	return (
		<div className='flex min-h-[60vh] flex-col items-center justify-center'>
			<Image
				alt='CVForge'
				className='mb-4 size-16'
				height={64}
				src='/logo.svg'
				width={64}
			/>
			<h1 className='text-3xl font-bold'>{t('title')}</h1>
			<p className='mt-2 max-w-sm text-center text-muted-foreground'>
				{t('description')}
			</p>
			{error === 'AccessDenied' ? (
				<p className='mt-4 max-w-sm text-center text-sm text-destructive'>
					{t('accessDenied')}
				</p>
			) : null}
			<SignInButton />
		</div>
	);
}

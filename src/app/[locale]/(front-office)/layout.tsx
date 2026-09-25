import Image from 'next/image';

import { LocaleSwitcher } from './locale-switcher';

export default function FrontOfficeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex min-h-screen flex-col'>
			<header className='flex items-center justify-between gap-2 border-b bg-white px-4 py-3 sm:px-6'>
				<div className='flex items-center gap-2'>
					<Image
						alt=''
						className='size-7'
						height={28}
						src='/logo.svg'
						width={28}
					/>
					<span className='text-lg font-semibold'>CV Forge</span>
				</div>
				<LocaleSwitcher />
			</header>
			<main className='flex min-h-0 flex-1 flex-col'>{children}</main>
		</div>
	);
}

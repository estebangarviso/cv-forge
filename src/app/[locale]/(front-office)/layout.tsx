import Image from 'next/image';

export default function FrontOfficeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='min-h-screen'>
			<header className='flex items-center gap-2 border-b bg-white px-6 py-4'>
				<Image
					alt=''
					className='size-7'
					height={28}
					src='/logo.svg'
					width={28}
				/>
				<span className='text-lg font-semibold'>CVForge</span>
			</header>
			<main className='p-6'>{children}</main>
		</div>
	);
}

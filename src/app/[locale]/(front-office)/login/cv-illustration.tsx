import Image from 'next/image';

export function CvIllustration() {
	return (
		<div className='relative aspect-square w-full max-w-[min(100%,40rem)]'>
			<Image
				alt=''
				className='object-contain'
				fill
				priority
				sizes='(min-width: 1280px) 40rem, 42vw'
				src='/cv-illustration.svg'
			/>
		</div>
	);
}

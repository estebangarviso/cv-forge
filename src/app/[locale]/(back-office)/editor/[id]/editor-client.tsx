'use client';

import type { CvData } from '@modules/cv';

import { CvForm } from '@modules/cv/presentation/components/cv-form';
import { CvPreview } from '@modules/cv/presentation/components/cv-preview';
import { PrintButton } from '@modules/cv/presentation/components/print-button';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

interface EditorClientProps {
	id: string;
	initialData?: CvData;
}

export function EditorClient({ id, initialData }: EditorClientProps) {
	const t = useTranslations('editor');
	const [previewData, setPreviewData] = useState<Partial<CvData>>(
		initialData ?? {},
	);

	const handleFormChange = useCallback((data: CvData) => {
		setPreviewData(data);
	}, []);

	const handleSubmit = useCallback((data: CvData) => {
		setPreviewData(data);
		// TODO: save to Drive via useSaveCv
	}, []);

	return (
		<div className='flex h-full gap-6 print:block'>
			<div className='w-100 shrink-0 print:hidden'>
				<div className='mb-3 flex items-center justify-between'>
					<h1 className='text-xl font-bold'>{t('title')}</h1>
					<PrintButton />
				</div>
				<CvForm
					defaultValues={initialData}
					onChange={handleFormChange}
					onSubmit={handleSubmit}
				/>
			</div>
			<div className='flex-1 overflow-auto'>
				<div className='mb-2 print:hidden'>
					<p className='text-sm text-muted-foreground'>
						{t('preview')}
					</p>
				</div>
				<CvPreview data={previewData as CvData} />
			</div>
		</div>
	);
}

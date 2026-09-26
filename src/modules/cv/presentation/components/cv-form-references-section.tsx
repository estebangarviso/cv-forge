'use client';

import { Input } from '@shared/ui/primitives/input';
import { useTranslations } from 'next-intl';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormReferencesSectionProps {
	form: UseFormReturn<CvData>;
}

export function CvFormReferencesSection({
	form,
}: CvFormReferencesSectionProps) {
	const t = useTranslations('cvForm');
	const { fields, insert, move, remove } = useFieldArray({
		control: form.control,
		name: 'references',
	});

	return (
		<SortableFieldArray
			emptyValue={{ email: '', name: '', phone: '' }}
			fields={fields}
			insert={insert}
			insertLabel={t('add')}
			move={move}
			renderItem={(i, handleProps) => (
				<div className='flex items-center gap-2'>
					<DragHandle {...handleProps} />
					<Input
						placeholder={t('refName')}
						{...form.register(`references.${i}.name`)}
					/>
					<Input
						placeholder={t('refEmail')}
						{...form.register(`references.${i}.email`)}
					/>
					<Input
						placeholder={t('refPhone')}
						{...form.register(`references.${i}.phone`)}
					/>
					<RemoveEntryButton onClick={() => remove(i)} />
				</div>
			)}
		/>
	);
}

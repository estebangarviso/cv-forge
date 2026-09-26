'use client';

import { Input } from '@shared/ui/primitives/input';
import { useTranslations } from 'next-intl';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { BulletsField } from './bullets-field';
import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormExperienceSectionProps {
	form: UseFormReturn<CvData>;
}

export function CvFormExperienceSection({
	form,
}: CvFormExperienceSectionProps) {
	const t = useTranslations('cvForm');
	const { fields, insert, move, remove } = useFieldArray({
		control: form.control,
		name: 'experience',
	});

	return (
		<SortableFieldArray
			emptyValue={{ bullets: [''], details: '', role: '' }}
			fields={fields}
			insert={insert}
			insertLabel={t('add')}
			move={move}
			renderItem={(i, handleProps) => (
				<div className='space-y-2 rounded border p-3'>
					<div className='flex items-center gap-2'>
						<DragHandle {...handleProps} />
						<Input
							placeholder={t('role')}
							{...form.register(`experience.${i}.role`)}
							className='flex-1'
						/>
						<RemoveEntryButton onClick={() => remove(i)} />
					</div>
					<Input
						placeholder={t('details')}
						{...form.register(`experience.${i}.details`)}
					/>
					<BulletsField
						control={form.control}
						jobIndex={i}
						setValue={form.setValue}
					/>
				</div>
			)}
		/>
	);
}

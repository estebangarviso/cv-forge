'use client';

import { Input } from '@shared/ui/primitives/input';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormEntryListProps {
	addLabel: string;
	form: UseFormReturn<CvData>;
	name: 'courses' | 'education' | 'extracurricular';
	subtitleLabel: string;
	titleLabel: string;
}

/** Title + subtitle sortable list shared by the education, courses and extracurricular sections. */
export function CvFormEntryList({
	addLabel,
	form,
	name,
	subtitleLabel,
	titleLabel,
}: CvFormEntryListProps) {
	const { fields, insert, move, remove } = useFieldArray({
		control: form.control,
		name,
	});

	return (
		<SortableFieldArray
			emptyValue={{ subtitle: '', title: '' }}
			fields={fields}
			insert={insert}
			insertLabel={addLabel}
			move={move}
			renderItem={(i, handleProps) => (
				<div className='flex items-center gap-2'>
					<DragHandle {...handleProps} />
					<Input
						placeholder={titleLabel}
						{...form.register(`${name}.${i}.title`)}
					/>
					<Input
						placeholder={subtitleLabel}
						{...form.register(`${name}.${i}.subtitle`)}
					/>
					<RemoveEntryButton onClick={() => remove(i)} />
				</div>
			)}
		/>
	);
}

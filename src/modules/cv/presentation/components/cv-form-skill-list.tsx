'use client';

import { Input } from '@shared/ui/primitives/input';
import { Slider } from '@shared/ui/primitives/slider';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormSkillListProps {
	addLabel: string;
	form: UseFormReturn<CvData>;
	labelPlaceholder: string;
	name: 'languages' | 'skills';
}

/** Label + 0-100 slider sortable list shared by the skills and languages sections. */
export function CvFormSkillList({
	addLabel,
	form,
	labelPlaceholder,
	name,
}: CvFormSkillListProps) {
	const { fields, insert, move, remove } = useFieldArray({
		control: form.control,
		name,
	});

	return (
		<SortableFieldArray
			emptyValue={{ label: '', level: 50 }}
			fields={fields}
			insert={insert}
			insertLabel={addLabel}
			move={move}
			renderItem={(i, handleProps) => (
				<div className='space-y-1 rounded border p-3'>
					<div className='flex items-center gap-2'>
						<DragHandle {...handleProps} />
						<Input
							placeholder={labelPlaceholder}
							{...form.register(`${name}.${i}.label`)}
							className='flex-1'
						/>
						<RemoveEntryButton onClick={() => remove(i)} />
					</div>
					<div className='flex items-center gap-3'>
						<Controller
							control={form.control}
							name={`${name}.${i}.level`}
							render={({ field: { onChange, value } }) => (
								<>
									<Slider
										className='flex-1'
										max={100}
										min={0}
										onValueChange={([v]) => onChange(v)}
										step={1}
										value={[value]}
									/>
									<span className='w-8 text-right text-xs text-muted-foreground'>
										{value}%
									</span>
								</>
							)}
						/>
					</div>
				</div>
			)}
		/>
	);
}

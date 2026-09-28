'use client';

import { Input } from '@shared/ui/primitives/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/ui/primitives/select';
import { useTranslations } from 'next-intl';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { OTHER_ICON_OPTIONS } from '../../domain/entities/cv-data';
import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormOtherSectionProps {
	form: UseFormReturn<CvData>;
}

export function CvFormOtherSection({ form }: CvFormOtherSectionProps) {
	const t = useTranslations('cvForm');
	const { fields, insert, move, remove } = useFieldArray({
		control: form.control,
		name: 'other',
	});

	return (
		<SortableFieldArray
			emptyValue={{ icon: 'auto', label: '', value: '' }}
			fields={fields}
			insert={insert}
			insertLabel={t('add')}
			move={move}
			renderItem={(i, handleProps) => (
				<div className='flex items-center gap-2'>
					<DragHandle {...handleProps} />
					<Controller
						control={form.control}
						name={`other.${i}.icon`}
						render={({ field }) => (
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<SelectTrigger className='w-28 shrink-0'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{OTHER_ICON_OPTIONS.map((icon) => (
										<SelectItem key={icon} value={icon}>
											{t(`otherIcon.${icon}`)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					<Input
						placeholder={t('otherLabel')}
						{...form.register(`other.${i}.label`)}
					/>
					<Input
						placeholder={t('otherValue')}
						{...form.register(`other.${i}.value`)}
					/>
					<RemoveEntryButton onClick={() => remove(i)} />
				</div>
			)}
		/>
	);
}

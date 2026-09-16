'use client';

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@shared/ui/primitives/alert-dialog';
import { Button } from '@shared/ui/primitives/button';
import {
	Table,
	TableBody,
	TableCell,
	TableRow,
} from '@shared/ui/primitives/table';
import { Textarea } from '@shared/ui/primitives/textarea';
import { GripVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import {
	type Control,
	Controller,
	type UseFormSetValue,
	useWatch,
} from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { InsertDivider } from './insert-divider';

interface BulletsFieldProps {
	control: Control<CvData>;
	jobIndex: number;
	setValue: UseFormSetValue<CvData>;
}

/**
 * One job entry's `bullets: string[]` as an editable, reorderable
 * single-column table — insert above/below any row, drag to reorder, delete
 * with a confirm dialog only when the row still has text.
 *
 * `bullets` is a plain string array, which react-hook-form's
 * `useFieldArray` can't type against (`FieldArrayPath` only accepts arrays
 * of objects) — row insert/remove/move are done as plain array edits via
 * `setValue` instead; only per-cell text editing goes through `Controller`
 * (whose `FieldPath` typing has no such restriction).
 */
export function BulletsField({
	control,
	jobIndex,
	setValue,
}: BulletsFieldProps) {
	const t = useTranslations('cvForm');
	const tCommon = useTranslations('common');
	const name = `experience.${jobIndex}.bullets` as const;
	const bulletsValue = useWatch({ control, name }) ?? [];

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

	const setBullets = (next: string[]) => {
		setValue(name, next, { shouldDirty: true });
	};

	const insertAt = (index: number) => {
		const next = [...bulletsValue];
		next.splice(index, 0, '');
		setBullets(next);
	};

	const removeAt = (index: number) => {
		setBullets(bulletsValue.filter((_, i) => i !== index));
	};

	const requestRemove = (index: number) => {
		if ((bulletsValue[index] ?? '').trim() === '') {
			removeAt(index);
			return;
		}
		setConfirmIndex(index);
	};

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const from = Number(active.id);
		const to = Number(over.id);
		if (from === to) return;
		const next = [...bulletsValue];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		setBullets(next);
	};

	return (
		<div className='space-y-2'>
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				sensors={sensors}
			>
				<SortableContext
					items={bulletsValue.map((_, i) => String(i))}
					strategy={verticalListSortingStrategy}
				>
					<Table>
						<TableBody>
							<InsertDividerRow
								label={t('addBullet')}
								onInsert={() => insertAt(0)}
							/>
							{bulletsValue.map((_, index) => (
								<Fragment key={index}>
									<SortableBulletRow
										control={control}
										// index-derived id — acceptable since
										// insert/remove/move always go through
										// setBullets, which re-renders the whole
										// list; only a brief animation glitch on
										// reorder, never a correctness issue.
										id={String(index)}
										index={index}
										name={name}
										onRemove={() => requestRemove(index)}
									/>
									<InsertDividerRow
										label={t('addBullet')}
										onInsert={() => insertAt(index + 1)}
									/>
								</Fragment>
							))}
						</TableBody>
					</Table>
				</SortableContext>
			</DndContext>

			<AlertDialog
				onOpenChange={(next) => !next && setConfirmIndex(null)}
				open={confirmIndex !== null}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t('deleteBulletTitle')}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t('deleteBulletDescription')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{tCommon('cancel')}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (confirmIndex !== null)
									removeAt(confirmIndex);
								setConfirmIndex(null);
							}}
						>
							{tCommon('delete')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function SortableBulletRow({
	control,
	id,
	index,
	name,
	onRemove,
}: {
	control: Control<CvData>;
	id: string;
	index: number;
	name: `experience.${number}.bullets`;
	onRemove: () => void;
}) {
	const t = useTranslations('cvForm');
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id });

	return (
		<TableRow
			ref={setNodeRef}
			style={{
				opacity: isDragging ? 0.5 : 1,
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			<TableCell className='w-8 p-2 align-top'>
				<button
					className='cursor-grab text-muted-foreground hover:text-foreground'
					type='button'
					{...attributes}
					{...listeners}
				>
					<GripVertical className='size-4' />
				</button>
			</TableCell>
			<TableCell className='p-2'>
				<Controller
					control={control}
					name={`${name}.${index}`}
					render={({ field }) => (
						<Textarea
							{...field}
							placeholder={t('bullets')}
							rows={2}
						/>
					)}
				/>
			</TableCell>
			<TableCell className='w-10 p-2 align-top'>
				<Button
					aria-label={t('removeBullet')}
					onClick={onRemove}
					size='icon'
					type='button'
					variant='ghost'
				>
					<X className='size-3.5' />
				</Button>
			</TableCell>
		</TableRow>
	);
}

/** Wraps the shared `InsertDivider` in a full-width table row so it can sit between/around `<TableRow>` siblings without breaking table semantics. */
function InsertDividerRow({
	label,
	onInsert,
}: {
	label: string;
	onInsert: () => void;
}) {
	return (
		<TableRow>
			<TableCell className='p-0' colSpan={3}>
				<InsertDivider label={label} onInsert={onInsert} />
			</TableCell>
		</TableRow>
	);
}

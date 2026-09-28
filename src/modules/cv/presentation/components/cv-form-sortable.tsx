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
import { Button } from '@shared/ui/primitives/button';
import { GripVertical } from 'lucide-react';
import { Fragment } from 'react';

import { InsertDivider } from './insert-divider';

export type DragHandleProps = React.HTMLAttributes<HTMLElement>;

interface RemoveEntryButtonProps {
	onClick: () => void;
}

interface SortableFieldArrayProps<T> {
	emptyValue: T;
	fields: { id: string }[];
	insert: (index: number, value: T) => void;
	insertLabel: string;
	move: (from: number, to: number) => void;
	renderItem: (
		index: number,
		handleProps: DragHandleProps,
	) => React.ReactNode;
}

interface SortableRowProps {
	children: (handleProps: DragHandleProps) => React.ReactNode;
	id: string;
}

function SortableRow({ children, id }: SortableRowProps) {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id });

	return (
		<div
			ref={setNodeRef}
			style={{
				opacity: isDragging ? 0.5 : 1,
				transform: CSS.Transform.toString(transform),
				transition,
			}}
		>
			{children({ ...attributes, ...listeners })}
		</div>
	);
}

export function DragHandle(props: DragHandleProps) {
	return (
		<button
			className='cursor-grab text-muted-foreground hover:text-foreground'
			type='button'
			{...props}
		>
			<GripVertical className='size-4' />
		</button>
	);
}

export function RemoveEntryButton({ onClick }: RemoveEntryButtonProps) {
	return (
		<Button onClick={onClick} size='sm' type='button' variant='ghost'>
			✕
		</Button>
	);
}

/** dnd-kit + insert-divider scaffolding shared by every sortable section of the CV form. */
export function SortableFieldArray<T>({
	emptyValue,
	fields,
	insert,
	insertLabel,
	move,
	renderItem,
}: SortableFieldArrayProps<T>) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const from = fields.findIndex((f) => f.id === active.id);
		const to = fields.findIndex((f) => f.id === over.id);
		if (from !== -1 && to !== -1) move(from, to);
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<SortableContext
				items={fields.map((f) => f.id)}
				strategy={verticalListSortingStrategy}
			>
				<InsertDivider
					label={insertLabel}
					onInsert={() => insert(0, emptyValue)}
				/>
				{fields.map((field, i) => (
					<Fragment key={field.id}>
						<SortableRow id={field.id}>
							{(handleProps) => renderItem(i, handleProps)}
						</SortableRow>
						<InsertDivider
							label={insertLabel}
							onInsert={() => insert(i + 1, emptyValue)}
						/>
					</Fragment>
				))}
			</SortableContext>
		</DndContext>
	);
}

'use client';

import { Button } from '@shared/ui/primitives/button';
import { Plus } from 'lucide-react';

interface InsertDividerProps {
	label: string;
	onInsert: () => void;
}

/** Hover-revealed "insert row here" affordance for a list boundary (before the first item, between two items, or after the last) — lets a field array grow at any position instead of only ever appending at the end. */
export function InsertDivider({ label, onInsert }: InsertDividerProps) {
	return (
		<div className='group relative my-1 flex items-center justify-center py-1'>
			<div className='absolute inset-0 flex items-center'>
				<div className='w-full border-t border-dashed border-muted-foreground/30 transition-colors group-hover:border-primary/60' />
			</div>
			<div className='relative z-10 flex justify-center opacity-40 transition-opacity group-hover:opacity-100'>
				<Button
					className='h-7 border-primary/40 bg-background px-2.5 text-xs text-primary shadow-xs hover:bg-primary hover:text-primary-foreground'
					onClick={onInsert}
					size='sm'
					type='button'
					variant='outline'
				>
					<Plus className='mr-1 size-3.5' />
					{label}
				</Button>
			</div>
		</div>
	);
}

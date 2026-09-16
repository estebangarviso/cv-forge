import { cn } from '@shared/utils/cn';
import * as React from 'react';

interface EmptyStateProps extends Omit<
	React.HTMLAttributes<HTMLDivElement>,
	'title'
> {
	action?: React.ReactNode;
	description?: React.ReactNode;
	title: React.ReactNode;
}

/** Generic empty / no-results placeholder for lists and tables. */
export function EmptyState({
	action,
	className,
	description,
	title,
	...props
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center gap-2 py-10 text-center',
				className,
			)}
			{...props}
		>
			<p className='text-sm font-medium text-foreground'>{title}</p>
			{description ? (
				<p className='max-w-sm text-sm text-muted-foreground'>
					{description}
				</p>
			) : null}
			{action}
		</div>
	);
}

'use client';

import { Button } from '@shared/ui/primitives/button';
import { cn } from '@shared/utils/cn';
import {
	type ColumnDef,
	columnFilteringFeature,
	columnVisibilityFeature,
	coreCellsFeature,
	coreColumnsFeature,
	coreHeadersFeature,
	createCoreRowModel,
	createFilteredRowModel,
	createSortedRowModel,
	flexRender,
	globalFilteringFeature,
	type RowData,
	rowPaginationFeature,
	rowSortingFeature,
	type SortingState,
	tableFeatures,
	useTable,
} from '@tanstack/react-table';
import { useState } from 'react';

const features = tableFeatures({
	columnFilteringFeature,
	columnVisibilityFeature,
	coreCellsFeature,
	coreColumnsFeature,
	coreHeadersFeature,
	coreRowModel: createCoreRowModel(),
	filteredRowModel: createFilteredRowModel(),
	globalFilteringFeature,
	rowPaginationFeature,
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

interface DataTableProps<TData extends RowData> {
	className?: string;
	columns: ColumnDef<typeof features, TData>[];
	data: TData[];
	pageSize?: number;
	searchPlaceholder?: string | null;
}

export function DataTable<TData extends RowData>({
	className,
	columns,
	data,
	pageSize = 10,
	searchPlaceholder = 'Search…',
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState('');

	const table = useTable({
		columns,
		data,
		features,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		state: {
			globalFilter,
			pagination: { pageIndex: 0, pageSize },
			sorting,
		},
	});

	return (
		<div className={cn('space-y-4', className)}>
			{searchPlaceholder !== null && (
				<input
					aria-label={searchPlaceholder}
					className='h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring'
					onChange={(event) => setGlobalFilter(event.target.value)}
					placeholder={searchPlaceholder}
					value={globalFilter}
				/>
			)}

			<div className='overflow-x-auto rounded-md border border-border'>
				<table className='w-full text-sm'>
					<thead className='bg-muted/50'>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								className='border-b border-border'
								key={headerGroup.id}
							>
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sorted = header.column.getIsSorted();
									return (
										<th
											className='px-4 py-3 text-left font-medium text-muted-foreground'
											key={header.id}
										>
											{header.isPlaceholder ? null : canSort ? (
												<button
													className='inline-flex items-center gap-1 hover:text-foreground'
													onClick={header.column.getToggleSortingHandler()}
													type='button'
												>
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)}
													<span aria-hidden='true'>
														{sorted === 'asc'
															? '▲'
															: sorted === 'desc'
																? '▼'
																: '↕'}
													</span>
												</button>
											) : (
												flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr
									className='border-b border-border last:border-0 hover:bg-muted/30'
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<td className='px-4 py-3' key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									className='px-4 py-10 text-center text-muted-foreground'
									colSpan={columns.length}
								>
									No results.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className='flex items-center justify-between gap-4'>
				<p className='text-sm text-muted-foreground'>
					Page {table.state.pagination.pageIndex + 1} of{' '}
					{table.getPageCount() || 1}
				</p>
				<div className='flex gap-2'>
					<Button
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.previousPage()}
						size='sm'
						variant='outline'
					>
						Previous
					</Button>
					<Button
						disabled={!table.getCanNextPage()}
						onClick={() => table.nextPage()}
						size='sm'
						variant='outline'
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

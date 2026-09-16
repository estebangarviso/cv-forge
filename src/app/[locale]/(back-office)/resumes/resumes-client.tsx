'use client';

import { Link, useRouter } from '@/i18n/navigation';
import {
	useCreateCv,
	useCvList,
	useDeleteCv,
	useDuplicateCv,
} from '@modules/cv';
import {
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	ScrollArea,
	Skeleton,
} from '@shared/ui';
import { Copy, FileText, Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

export function ResumesClient() {
	const t = useTranslations('resumes');
	const tc = useTranslations('common');
	const locale = useLocale();
	const router = useRouter();
	const { data: cvs, isLoading } = useCvList();
	const createCv = useCreateCv();
	const deleteCv = useDeleteCv();
	const duplicateCv = useDuplicateCv();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [duplicateError, setDuplicateError] = useState<string | null>(null);
	const [nameOpen, setNameOpen] = useState(false);
	const [newName, setNewName] = useState('');

	function openCreateDialog() {
		setNewName('');
		setNameOpen(true);
	}

	async function handleCreate() {
		setNameOpen(false);
		const created = await createCv.mutateAsync(newName.trim() || undefined);
		router.push(`/editor/${created.id}`);
	}

	function handleDelete() {
		if (!deleteId) return;
		deleteCv.mutate(deleteId, {
			onSuccess: () => setDeleteId(null),
		});
	}

	async function handleDuplicate(sourceId: string, sourceTitle: string) {
		setDuplicateError(null);
		const copyText = locale === 'es' ? 'Copia' : 'Copy';
		const copyTitle = `${sourceTitle} - ${copyText}`;

		try {
			const duplicated = await duplicateCv.mutateAsync({
				copyTitle,
				sourceId,
			});
			router.push(`/editor/${duplicated.id}`);
		} catch (error) {
			const errorMsg =
				error instanceof Error ? error.message : 'DUPLICATE_FAILED';
			setDuplicateError(errorMsg);
		}
	}

	return (
		<ScrollArea className='h-full'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>{t('title')}</h1>
				<Button
					disabled={createCv.isPending}
					onClick={openCreateDialog}
				>
					<Plus className='mr-2 size-4' />
					{createCv.isPending ? t('creating') : t('create')}
				</Button>
			</div>

			{duplicateError && (
				<div className='mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
					{t(
						`duplicateError${duplicateError === 'NAME_CONFLICT' ? 'Conflict' : 'Failed'}`,
					) ?? t('duplicateErrorFailed')}
				</div>
			)}

			{isLoading ? (
				<div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className='h-5 w-3/4' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-4 w-1/2' />
							</CardContent>
							<CardFooter>
								<Skeleton className='h-4 w-2/3' />
							</CardFooter>
						</Card>
					))}
				</div>
			) : cvs?.length ? (
				<div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{cvs.map((cv) => (
						<Card
							className='group relative transition-shadow hover:shadow-md'
							key={cv.id}
						>
							<Link
								className='absolute inset-0'
								href={`/editor/${cv.id}`}
							/>
							<CardHeader className='flex-row items-start justify-between'>
								<CardTitle className='text-base'>
									{cv.cvTitle || t('untitled')}
								</CardTitle>
								<div className='relative z-10 flex gap-1 opacity-0 group-hover:opacity-100'>
									<Button
										aria-label={t('duplicate')}
										disabled={duplicateCv.isPending}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (!cv.id) return;
											void handleDuplicate(
												cv.id,
												cv.cvTitle || t('untitled'),
											);
										}}
										size='icon'
										title={t('duplicate')}
										variant='ghost'
									>
										<Copy className='size-4' />
									</Button>
									<Button
										className='opacity-100'
										onClick={(e) => {
											e.preventDefault();
											setDeleteId(cv.id ?? null);
										}}
										size='icon'
										variant='ghost'
									>
										<Trash2 className='size-4' />
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<p className='text-sm text-muted-foreground'>
									{cv.cvTitle || '—'}
								</p>
							</CardContent>
							{cv.updatedAt && (
								<CardFooter>
									<p className='text-xs text-muted-foreground'>
										{t('lastUpdated')}:{' '}
										{new Date(
											cv.updatedAt,
										).toLocaleDateString()}
									</p>
								</CardFooter>
							)}
						</Card>
					))}
				</div>
			) : (
				<div className='mt-16 flex flex-col items-center gap-4 text-center'>
					<FileText className='size-12 text-muted-foreground' />
					<p className='text-muted-foreground'>{t('empty')}</p>
					<Button
						disabled={createCv.isPending}
						onClick={openCreateDialog}
					>
						<Plus className='mr-2 size-4' />
						{t('create')}
					</Button>
				</div>
			)}

			{/* Create CV name dialog */}
			<Dialog onOpenChange={setNameOpen} open={nameOpen}>
				<DialogContent className='sm:max-w-sm'>
					<DialogHeader>
						<DialogTitle>{t('createTitle')}</DialogTitle>
					</DialogHeader>
					<div className='space-y-2'>
						<Label htmlFor='cv-name'>{t('nameLabel')}</Label>
						<Input
							id='cv-name'
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) =>
								e.key === 'Enter' && handleCreate()
							}
							placeholder={t('namePlaceholder')}
							value={newName}
						/>
					</div>
					<DialogFooter>
						<Button
							onClick={() => setNameOpen(false)}
							variant='outline'
						>
							{tc('cancel')}
						</Button>
						<Button
							disabled={createCv.isPending}
							onClick={handleCreate}
						>
							{createCv.isPending
								? t('creating')
								: t('createConfirm')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				onOpenChange={(open) => !open && setDeleteId(null)}
				open={!!deleteId}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('deleteTitle')}</DialogTitle>
						<DialogDescription>
							{t('deleteConfirm')}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							onClick={() => setDeleteId(null)}
							variant='outline'
						>
							{tc('cancel')}
						</Button>
						<Button
							disabled={deleteCv.isPending}
							onClick={handleDelete}
							variant='destructive'
						>
							{tc('delete')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</ScrollArea>
	);
}

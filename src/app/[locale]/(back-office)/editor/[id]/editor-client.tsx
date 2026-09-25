'use client';

import type { DocumentProps } from '@react-pdf/renderer';

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
	ScrollArea,
	Tabs,
	TabsList,
	TabsTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/shared/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	type CvData,
	CvDataSchema,
	CvForm,
	CvPdfDocument,
	EMPTY_CV,
	ThemeDialog,
	TypographyDialog,
	useCustomFont,
	useCv,
	useCvEditorStore,
	useSaveCv,
} from '@modules/cv';
import { PDFDownloadButton, PdfViewer } from '@shared/ui/pdf';
import { useAsyncDebouncer } from '@tanstack/react-pacer';
import { CloudUpload, Loader2, Palette, Type, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface EditorClientProps {
	id: string;
}

/** Below `lg` the form and preview share one column, switched by tab; at `lg`+ both show side by side. */
type MobileView = 'form' | 'preview';

function dropzoneClassName(isDragOver: boolean): string {
	const border = isDragOver
		? 'border-primary bg-primary/5'
		: 'border-muted-foreground/25 hover:border-primary/50';
	return `flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${border}`;
}

function editorColumnClassName(
	hasContent: boolean,
	mobileView: MobileView,
): string {
	const visible = !hasContent || mobileView === 'form';
	const display = visible ? 'flex' : 'hidden lg:flex';
	return hasContent
		? `${display} min-h-0 min-w-80 flex-1 flex-col lg:max-w-xl xl:max-w-2xl`
		: `${display} min-h-0 flex-1 flex-col`;
}

function previewColumnClassName(mobileView: MobileView): string {
	return mobileView === 'preview'
		? 'flex min-h-0 flex-1 flex-col'
		: 'hidden min-h-0 flex-1 flex-col lg:flex';
}

/** Swaps to a disabled/spinner state while the CV's custom font is still being fetched+registered — exporting before then would render with the wrong font. */
function ExportButton({
	cvDocument,
	fileName,
	label,
	ready,
}: {
	cvDocument: React.ReactElement<DocumentProps>;
	fileName: string;
	label: string;
	ready: boolean;
}) {
	if (!ready) {
		return (
			<Button aria-label={label} disabled size='icon' variant='outline'>
				<Loader2 className='size-4 animate-spin' />
			</Button>
		);
	}
	return (
		<PDFDownloadButton
			fileName={fileName}
			label={label}
			pdfDocument={cvDocument}
		/>
	);
}

/** Same custom-font readiness gate as `ExportButton`, for the live preview pane.
 * The PDF itself only ever shows the last-saved data (see EditorClient) — a
 * ghost overlay indicates unsaved edits instead of re-rendering it. */
function PreviewPane({
	cvDocument,
	editingLabel,
	isDirty,
	loadingLabel,
	ready,
}: {
	cvDocument: React.ReactElement<DocumentProps>;
	editingLabel: string;
	isDirty: boolean;
	loadingLabel: string;
	ready: boolean;
}) {
	if (!ready) {
		return (
			<div className='flex h-full items-center justify-center'>
				<p className='text-sm text-muted-foreground'>{loadingLabel}</p>
			</div>
		);
	}
	return (
		<div className='relative h-full'>
			<PdfViewer>{cvDocument}</PdfViewer>
			{isDirty && (
				<div className='absolute inset-0 flex items-center justify-center gap-2 bg-background/60 backdrop-blur-[1px]'>
					<Loader2 className='size-4 animate-spin text-muted-foreground' />
					<p className='text-sm text-muted-foreground'>
						{editingLabel}
					</p>
				</div>
			)}
		</div>
	);
}

export function EditorClient({ id }: EditorClientProps) {
	const t = useTranslations('editor');
	const tCommon = useTranslations('common');
	const { data, error, isLoading } = useCv(id);
	const {
		data: savedCv,
		error: saveError,
		isError: isSaveError,
		isPending: _isSaving,
		isSuccess: isSaveSuccess,
		mutate: saveCv,
		mutateAsync: saveCvAsync,
	} = useSaveCv();
	const isDirty = useCvEditorStore((s) => s.isDirty);
	const setDirty = useCvEditorStore((s) => s.setDirty);
	const isResettingRef = useRef(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const saveDebouncer = useAsyncDebouncer(
		async (values: CvData) => {
			await saveCvAsync({ ...values, id });
		},
		{ onUnmount: (d) => d.flush(), wait: 2000 },
	);

	const form = useForm<CvData>({
		defaultValues: EMPTY_CV,
		mode: 'onChange',
		resolver: zodResolver(CvDataSchema) as Resolver<CvData>,
	});

	// live preview data — only ever set from load or a successful save (see
	// below), never from every keystroke: re-rendering the whole react-pdf
	// document (layout/shaping/serialization) on each change was too heavy
	// while typing (see cv-editor-split-view skill). The preview instead stays
	// static and a small spinner (isDirty) indicates it's out of date.
	const [previewData, setPreviewData] = useState<CvData>(EMPTY_CV);

	// reset form (+ preview) when API data loads
	useEffect(() => {
		if (data) {
			isResettingRef.current = true;
			form.reset(data);
			setPreviewData(data);
			queueMicrotask(() => {
				isResettingRef.current = false;
			});
		}
	}, [data, form]);

	// debounced auto-save via a single watch subscription — the preview
	// itself is untouched here; it only updates once a save succeeds, below.
	useEffect(() => {
		const subscription = form.watch(() => {
			if (isResettingRef.current) return;
			setDirty(true);
			const values = form.getValues() as CvData;
			void saveDebouncer.maybeExecute(values);
		});
		return () => subscription.unsubscribe();
	}, [form, saveDebouncer, setDirty]);

	// refresh the preview with the round-tripped saved data once a save
	// completes — the only time the PDF document is rebuilt after the initial
	// load.
	useEffect(() => {
		if (savedCv) setPreviewData(savedCv);
	}, [savedCv]);

	// clear dirty flag on successful save
	useEffect(() => {
		if (isSaveSuccess) setDirty(false);
	}, [isSaveSuccess, setDirty]);

	// show toast on save outcome
	useEffect(() => {
		if (isSaveSuccess) toast.success(t('saved'), { duration: 1500 });
	}, [isSaveSuccess, t]);

	useEffect(() => {
		if (isSaveError) {
			const msg =
				saveError?.message === 'NAME_CONFLICT'
					? t('nameConflict')
					: t('saveError');
			toast.error(msg);
		}
	}, [isSaveError, saveError, t]);

	// manual save (submit button) — immediate, cancels pending debounce
	const handleSubmit = (formData: CvData) => {
		saveDebouncer.cancel();
		saveCv({ ...formData, id });
	};

	const cvDocument = useMemo(
		() => <CvPdfDocument data={previewData} />,
		[previewData],
	);
	const { isError: customFontError, isReady: customFontReady } =
		useCustomFont(
			previewData.theme?.typography?.customFontId,
			previewData.theme?.typography?.customFontBoldId,
		);

	// surfaces a stale/deleted font id (see useCustomFont's error-unblocked
	// `isReady`) instead of silently falling back to the bundled font.
	useEffect(() => {
		if (customFontError) toast.error(t('customFontError'));
	}, [customFontError, t]);

	const [isDragOver, setIsDragOver] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [typographyOpen, setTypographyOpen] = useState(false);
	const [themeOpen, setThemeOpen] = useState(false);
	const [mobileView, setMobileView] = useState<MobileView>('form');

	const handleImportJson = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const processJsonFile = useCallback(
		(file: File) => {
			void (async () => {
				try {
					const text = await file.text();
					const parsed = JSON.parse(text) as Record<string, unknown>;
					const validated = CvDataSchema.parse({ ...parsed, id });
					form.reset(validated);
					setDirty(true);
					setImportOpen(false);
				} catch {
					console.error('Invalid CV JSON file');
				}
			})();
		},
		[form, id, setDirty, setImportOpen],
	);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			processJsonFile(file);
			e.target.value = '';
		},
		[processJsonFile],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file?.name.endsWith('.json')) {
				processJsonFile(file);
			}
		},
		[processJsonFile],
	);

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<p className='text-muted-foreground'>{tCommon('loading')}</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex h-full items-center justify-center'>
				<p className='text-destructive'>{t('loadError')}</p>
			</div>
		);
	}

	// `Boolean(...)` because `experience?.length` can be `0` — `{hasContent && <div/>}`
	// would otherwise render the literal number instead of nothing.
	const hasContent = Boolean(
		previewData.name || previewData.title || previewData.experience?.length,
	);

	return (
		<>
			<Dialog onOpenChange={setImportOpen} open={importOpen}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>{t('importJson')}</DialogTitle>
						<DialogDescription>
							{t('dropJsonHint')}
						</DialogDescription>
					</DialogHeader>
					<div
						className={dropzoneClassName(isDragOver)}
						onClick={handleImportJson}
						onDragLeave={handleDragLeave}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onKeyDown={(e) =>
							e.key === 'Enter' && handleImportJson()
						}
						role='button'
						tabIndex={0}
					>
						<CloudUpload className='mb-3 size-10 text-muted-foreground' />
						<p className='text-sm font-medium'>{t('dropJson')}</p>
						<p className='mt-1 text-xs text-muted-foreground'>
							{t('dropJsonHint')}
						</p>
						<Button className='mt-4' size='sm' variant='outline'>
							{t('browseFiles')}
						</Button>
					</div>
					<input
						accept='.json'
						className='hidden'
						onChange={handleFileChange}
						ref={fileInputRef}
						type='file'
					/>
				</DialogContent>
			</Dialog>

			<TypographyDialog
				form={form}
				onOpenChange={setTypographyOpen}
				open={typographyOpen}
			/>

			<ThemeDialog
				form={form}
				onOpenChange={setThemeOpen}
				open={themeOpen}
			/>

			<div className='flex h-full min-h-0 flex-col gap-3 overflow-hidden'>
				{hasContent && (
					<Tabs
						className='shrink-0 lg:hidden'
						onValueChange={(v) => setMobileView(v as MobileView)}
						value={mobileView}
					>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger value='form'>
								{t('formTab')}
							</TabsTrigger>
							<TabsTrigger value='preview'>
								{t('preview')}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				)}
				<div className='flex min-h-0 flex-1 gap-6 overflow-hidden'>
					<div
						className={editorColumnClassName(
							hasContent,
							mobileView,
						)}
					>
						<div className='mb-3 flex shrink-0 items-center justify-between'>
							<div className='flex-1'>
								<Input
									className='size-auto border-0 bg-transparent p-0 text-xl font-bold shadow-none focus-visible:ring-1 focus-visible:ring-ring'
									onChange={(e) =>
										form.setValue(
											'cvTitle',
											e.target.value,
											{
												shouldDirty: true,
											},
										)
									}
									placeholder={t('untitled')}
									value={form.watch('cvTitle') ?? ''}
								/>
							</div>
							<div className='flex items-center gap-2'>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											aria-label={t('importJson')}
											onClick={() => setImportOpen(true)}
											size='icon'
											variant='outline'
										>
											<Upload className='size-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{t('importJson')}
									</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											aria-label={t('typography')}
											onClick={() =>
												setTypographyOpen(true)
											}
											size='icon'
											variant='outline'
										>
											<Type className='size-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{t('typography')}
									</TooltipContent>
								</Tooltip>{' '}
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											aria-label={t('theme')}
											onClick={() => setThemeOpen(true)}
											size='icon'
											variant='outline'
										>
											<Palette className='size-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{t('theme')}
									</TooltipContent>
								</Tooltip>{' '}
								<ExportButton
									cvDocument={cvDocument}
									fileName={`${previewData.cvTitle || previewData.name || 'cv'}.pdf`}
									label={t('downloadPdf')}
									ready={customFontReady}
								/>
							</div>
						</div>
						<ScrollArea className='min-h-0 flex-1'>
							<CvForm
								form={form}
								key={`${data?.id ?? id}:${data?.updatedAt ?? ''}`}
								onSubmit={handleSubmit}
							/>
						</ScrollArea>
					</div>
					{hasContent && (
						<div className={previewColumnClassName(mobileView)}>
							<PreviewPane
								cvDocument={cvDocument}
								editingLabel={t('editing')}
								isDirty={isDirty}
								loadingLabel={t('loadingFont')}
								ready={customFontReady}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

'use client';

import type { CustomFont } from '@modules/font';

import {
	Accordion,
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	EmptyState,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/shared/ui';
import { PDF_FONTS } from '@shared/ui/pdf';
import { CloudUpload, FileType, Loader2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type UIEvent, useMemo, useRef, useState } from 'react';
import {
	type Control,
	Controller,
	type FieldPath,
	type UseFormReturn,
	useWatch,
} from 'react-hook-form';
import { toast } from 'sonner';

import type { CvData } from '../../domain/entities/cv-data';

import {
	DEFAULT_TYPOGRAPHY,
	TYPOGRAPHY_ROLES,
} from '../../domain/entities/template-config';
import {
	DuplicateFontError,
	useCustomFont,
	useDeleteFont,
	useFontsList,
	useUploadFont,
} from '../hooks/use-custom-font';

interface TypographyDialogProps {
	form: UseFormReturn<CvData>;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

const TEXT_TRANSFORMS = [
	'none',
	'uppercase',
	'lowercase',
	'capitalize',
	'upperfirst',
] as const;

// full catalog of tags this app knows how to label/group — NOT all fonts
// implement all of these. `TypographyDialog` filters each group down to the
// tags the currently selected `PdfFontConfig.features` actually lists, so a
// richer future font (or an uploaded one, Fase 4) shows more toggles here
// with zero changes to this file — only its own `features` array needs to
// be accurate (verified with fontkit, see the react-pdf-cv-rendering skill).
const FEATURE_CATALOG = [
	{ key: 'ligaturesGroup', tags: ['liga', 'dlig', 'hlig', 'calt'] },
	{ key: 'numeralsGroup', tags: ['onum', 'lnum', 'tnum', 'zero', 'frac'] },
	{ key: 'smallCapsGroup', tags: ['smcp', 'c2sc'] },
	{ key: 'stylisticGroup', tags: ['ss01', 'ss02', 'ss03', 'ss04'] },
] as const;

const NO_OVERRIDE = '__default';

/** A custom font's role in the active theme — `'none'` fonts sit in the table unused. Bold reuses the regular font's id as its shared family name (see `useCustomFont`), so it can't exist without one. */
type FontRole = 'bold' | 'none' | 'regular';

function NumberField({
	control,
	label,
	max,
	min,
	name,
	step,
}: {
	control: Control<CvData>;
	label: string;
	max: number;
	min: number;
	name: FieldPath<CvData>;
	step: number;
}) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className='space-y-1'>
					<Label>{label}</Label>
					<Input
						max={max}
						min={min}
						onChange={(e) => {
							const next = e.target.valueAsNumber;
							field.onChange(
								Number.isNaN(next) ? undefined : next,
							);
						}}
						step={step}
						type='number'
						value={
							typeof field.value === 'number' ? field.value : ''
						}
					/>
				</div>
			)}
		/>
	);
}

interface CustomFontsTableProps {
	boldId?: string;
	deleteLabel: string;
	emptyDescription: string;
	emptyTitle: string;
	fileLabel: string;
	fonts: CustomFont[];
	isFetchingNextPage: boolean;
	isLoading: boolean;
	loadingLabel: string;
	loadingMoreLabel: string;
	onDelete: (font: CustomFont) => void;
	onRoleChange: (fontId: string, role: FontRole) => void;
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
	regularId?: string;
	roleBoldLabel: string;
	roleNoneLabel: string;
	roleRegularLabel: string;
	styleLabel: string;
}

// header + 10 compact rows (see the row `py-1` below) before scrolling kicks in.
const TABLE_MAX_HEIGHT = 'max-h-96';

/** Every font uploaded to Drive (across all CVs, lazy-loaded 10 at a time), letting the user assign/swap/unassign its regular or bold role via a per-row select, and delete it outright — replaces the old fixed two-slot cards, which never showed fonts beyond whatever was already assigned. */
function CustomFontsTable({
	boldId,
	deleteLabel,
	emptyDescription,
	emptyTitle,
	fileLabel,
	fonts,
	isFetchingNextPage,
	isLoading,
	loadingLabel,
	loadingMoreLabel,
	onDelete,
	onRoleChange,
	onScroll,
	regularId,
	roleBoldLabel,
	roleNoneLabel,
	roleRegularLabel,
	styleLabel,
}: CustomFontsTableProps) {
	if (isLoading) {
		return (
			<p className='py-6 text-center text-xs text-muted-foreground'>
				{loadingLabel}
			</p>
		);
	}
	if (fonts.length === 0) {
		return <EmptyState description={emptyDescription} title={emptyTitle} />;
	}
	return (
		<div>
			<div
				className={`${TABLE_MAX_HEIGHT} overflow-y-auto`}
				onScroll={onScroll}
			>
				<Table>
					<TableHeader className='sticky top-0 z-10 bg-background'>
						<TableRow>
							<TableHead className='px-4 py-2'>
								{fileLabel}
							</TableHead>
							<TableHead className='px-4 py-2'>
								{styleLabel}
							</TableHead>
							<TableHead className='w-10 px-4 py-2' />
						</TableRow>
					</TableHeader>
					<TableBody>
						{fonts.map((font) => {
							const role: FontRole =
								font.id === regularId
									? 'regular'
									: font.id === boldId
										? 'bold'
										: 'none';
							return (
								<TableRow key={font.id}>
									<TableCell className='px-4 py-1'>
										<div
											className={`flex min-w-0 items-center gap-2 ${
												role === 'none'
													? 'opacity-50'
													: ''
											}`}
										>
											<FileType className='size-4 shrink-0 text-muted-foreground' />
											<span
												className='truncate text-sm'
												title={font.originalFileName}
											>
												{font.originalFileName}
											</span>
										</div>
									</TableCell>
									<TableCell className='px-4 py-1'>
										<Select
											onValueChange={(value) =>
												onRoleChange(
													font.id,
													value as FontRole,
												)
											}
											value={role}
										>
											<SelectTrigger className='h-8 w-32'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='none'>
													{roleNoneLabel}
												</SelectItem>
												<SelectItem value='regular'>
													{roleRegularLabel}
												</SelectItem>
												<SelectItem value='bold'>
													{roleBoldLabel}
												</SelectItem>
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell className='px-4 py-1'>
										<Button
											aria-label={deleteLabel}
											onClick={() => onDelete(font)}
											size='icon'
											type='button'
											variant='ghost'
										>
											<Trash2 className='size-4' />
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
			{isFetchingNextPage && (
				<p className='py-1 text-center text-xs text-muted-foreground'>
					{loadingMoreLabel}
				</p>
			)}
		</div>
	);
}

/** Drag-and-drop + multi-select zone for uploading up to 2 font files at once — role assignment happens afterwards in the fonts table below, not here. */
function FontDropzone({
	busy,
	hint,
	label,
	onFiles,
}: {
	busy: boolean;
	hint: string;
	label: string;
	onFiles: (files: File[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	return (
		<div
			className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
				isDragOver
					? 'border-primary bg-primary/5'
					: 'border-muted-foreground/25 hover:border-primary/50'
			} ${busy ? 'pointer-events-none opacity-60' : ''}`}
			onClick={() => inputRef.current?.click()}
			onDragLeave={() => setIsDragOver(false)}
			onDragOver={(e) => {
				e.preventDefault();
				setIsDragOver(true);
			}}
			onDrop={(e) => {
				e.preventDefault();
				setIsDragOver(false);
				onFiles([...e.dataTransfer.files]);
			}}
			onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
			role='button'
			tabIndex={0}
		>
			{busy ? (
				<Loader2 className='size-8 shrink-0 animate-spin text-muted-foreground' />
			) : (
				<CloudUpload className='size-8 shrink-0 text-muted-foreground' />
			)}
			<div className='text-left'>
				<p className='text-sm font-medium'>{label}</p>
				<p className='text-xs text-muted-foreground'>{hint}</p>
			</div>
			<input
				accept='.ttf,.otf,.woff,.woff2'
				className='hidden'
				multiple
				onChange={(e) => {
					onFiles([...(e.target.files ?? [])]);
					e.target.value = '';
				}}
				ref={inputRef}
				type='file'
			/>
		</div>
	);
}

const CUSTOM_FONT_ID_PATH = 'theme.typography.customFontId' as const;
const CUSTOM_FONT_BOLD_ID_PATH = 'theme.typography.customFontBoldId' as const;

interface CustomFontAssignment {
	customFontBoldId?: string;
	customFontId?: string;
}

/**
 * Computes the next regular/bold assignment after giving `fontId` `role`.
 * Picking a role already held by ANOTHER font swaps the two (regular ↔
 * bold) instead of just displacing the other one to unassigned, so
 * reassigning a pair never silently drops one of them. `role: 'none'` is
 * also how deleting a font un-assigns it, since the effect is identical.
 */
function computeFontRoleAssignment(
	current: CustomFontAssignment,
	fontId: string,
	role: FontRole,
): CustomFontAssignment {
	if (role === 'none') {
		if (fontId === current.customFontId) return {};
		if (fontId === current.customFontBoldId) {
			return { customFontId: current.customFontId };
		}
		return current;
	}
	if (role === 'regular') {
		const nextBoldId =
			fontId === current.customFontBoldId
				? current.customFontId
				: current.customFontBoldId;
		return { customFontBoldId: nextBoldId, customFontId: fontId };
	}
	const nextRegularId =
		fontId === current.customFontId
			? current.customFontBoldId
			: current.customFontId;
	return { customFontBoldId: fontId, customFontId: nextRegularId };
}

export function TypographyDialog({
	form,
	onOpenChange,
	open,
}: TypographyDialogProps) {
	const t = useTranslations('typography');
	const tCommon = useTranslations('common');
	const tRoles = useTranslations('typography.roles');
	const tTransform = useTranslations('typography.textTransform');
	const tFeatures = useTranslations('typography.openType');

	// `useWatch` (not a bare `form.watch()` in the render body) so the
	// Estilo select and its "Sin asignar" state reliably re-render right
	// after `setFontRole`'s `setValue` calls, even for these two
	// never-`register`ed fields.
	const fontFamily = useWatch({
		control: form.control,
		name: 'theme.typography.fontFamily',
	});
	const customFontId = useWatch({
		control: form.control,
		name: CUSTOM_FONT_ID_PATH,
	});
	const customFontBoldId = useWatch({
		control: form.control,
		name: CUSTOM_FONT_BOLD_ID_PATH,
	});
	const currentFont = PDF_FONTS.find((f) => f.family === fontFamily);
	const availableWeights = currentFont?.weights ?? [400, 700];
	const uploadFont = useUploadFont();
	const { features: customFeatures } = useCustomFont(
		customFontId,
		customFontBoldId,
	);
	const fontsListQuery = useFontsList();
	const fontsList = useMemo(
		() => fontsListQuery.data?.pages.flatMap((page) => page.fonts) ?? [],
		[fontsListQuery.data],
	);
	const deleteFont = useDeleteFont();

	// a same-named font found in Drive waits here for the user to confirm
	// the overwrite (AlertDialog below) instead of uploading blind.
	const [pendingOverwrites, setPendingOverwrites] = useState<
		{ existing: CustomFont; file: File }[]
	>([]);
	const currentOverwrite = pendingOverwrites[0];
	const [fontToDelete, setFontToDelete] = useState<CustomFont>();

	const applyFontAssignment = (next: CustomFontAssignment) => {
		form.setValue(CUSTOM_FONT_ID_PATH, next.customFontId, {
			shouldDirty: true,
		});
		form.setValue(CUSTOM_FONT_BOLD_ID_PATH, next.customFontBoldId, {
			shouldDirty: true,
		});
	};

	// reads live form values instead of the render-scoped `customFontId`/
	// `customFontBoldId` above — those come from `form.watch()` in the render
	// body, which can lag by a render between two quick role picks and would
	// otherwise silently revert whichever font was just assigned.
	const currentFontAssignment = (): CustomFontAssignment => ({
		customFontBoldId: form.getValues(CUSTOM_FONT_BOLD_ID_PATH),
		customFontId: form.getValues(CUSTOM_FONT_ID_PATH),
	});

	/**
	 * Uploads `file`. Without `overwriteId`, the server checks Drive for a
	 * font already saved under this exact file name — never trusts local
	 * form state for that, since the same name can already exist from a
	 * different CV/session than the one currently open. A
	 * `DuplicateFontError` queues a confirmation instead of silently
	 * creating a second file; confirming re-calls this with the found
	 * file's id as `overwriteId` to replace its content in place. Either
	 * way the font just lands in the table below — assigning it a role is
	 * a separate, explicit step, never automatic.
	 */
	const performUpload = (file: File, overwriteId?: string) => {
		const family = file.name.replace(/\.[^.]+$/u, '');
		uploadFont.mutate(
			{ family, file, overwriteId },
			{
				onError: (error) => {
					if (!overwriteId && error instanceof DuplicateFontError) {
						setPendingOverwrites((prev) => [
							...prev,
							{ existing: error.existing, file },
						]);
						return;
					}
					toast.error(t('font.uploadError'));
				},
			},
		);
	};

	// guarded so a duplicate resolve (Action's onClick + the onOpenChange it
	// also triggers on close) never uploads or advances the queue twice.
	const resolveOverwrite = (proceed: boolean) => {
		setPendingOverwrites((prev) => {
			if (prev.length === 0) return prev;
			const [head] = prev;
			if (proceed) performUpload(head.file, head.existing.id);
			return prev.slice(1);
		});
	};

	const setFontRole = (fontId: string, role: FontRole) => {
		applyFontAssignment(
			computeFontRoleAssignment(currentFontAssignment(), fontId, role),
		);
	};

	const confirmDelete = () => {
		if (!fontToDelete) return;
		const { id } = fontToDelete;
		setFontToDelete(undefined);
		deleteFont.mutate(id, {
			onError: () => toast.error(t('font.deleteError')),
			onSuccess: () => {
				applyFontAssignment(
					computeFontRoleAssignment(
						currentFontAssignment(),
						id,
						'none',
					),
				);
			},
		});
	};

	const handleFontsScroll = (event: UIEvent<HTMLDivElement>) => {
		const el = event.currentTarget;
		const nearBottom =
			el.scrollHeight - el.scrollTop - el.clientHeight < 48;
		if (
			nearBottom &&
			fontsListQuery.hasNextPage &&
			!fontsListQuery.isFetchingNextPage
		) {
			void fontsListQuery.fetchNextPage();
		}
	};

	// only show a toggle for a tag the ACTIVE font actually implements —
	// the selected custom font once uploaded (verified server-side with
	// fontkit at upload time), otherwise the selected bundled
	// `PdfFontConfig.features` (verified once per font, see the config file).
	// Swapping fonts can reveal or hide groups/toggles with no dialog changes.
	const supportedFeatures = new Set(
		customFontId ? (customFeatures ?? []) : (currentFont?.features ?? []),
	);
	const visibleFeatureGroups = FEATURE_CATALOG.map((group) => ({
		...group,
		tags: group.tags.filter((tag) => supportedFeatures.has(tag)),
	})).filter((group) => group.tags.length > 0);
	const isLoadingCustomFeatures =
		!!customFontId && customFeatures === undefined;

	return (
		<>
			<Dialog onOpenChange={onOpenChange} open={open}>
				<DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>{t('title')}</DialogTitle>
						<DialogDescription>
							{t('description')}
						</DialogDescription>
					</DialogHeader>

					<Tabs defaultValue='font'>
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='font'>
								{t('tabs.font')}
							</TabsTrigger>
							<TabsTrigger value='global'>
								{t('tabs.global')}
							</TabsTrigger>
							<TabsTrigger value='roles'>
								{t('tabs.roles')}
							</TabsTrigger>
							<TabsTrigger value='openType'>
								{t('tabs.openType')}
							</TabsTrigger>
						</TabsList>

						<TabsContent className='space-y-3 pt-3' value='font'>
							<Controller
								control={form.control}
								name='theme.typography.fontFamily'
								render={({ field }) => (
									<div className='space-y-1'>
										<Label>{t('font.family')}</Label>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{PDF_FONTS.map((f) => (
													<SelectItem
														key={f.family}
														value={f.family}
													>
														{f.family}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							/>
							<p className='text-xs text-muted-foreground'>
								{t('font.onlyBundled')}
							</p>

							<div className='space-y-2 border-t pt-3'>
								<div>
									<Label>{t('font.customFont')}</Label>
									<p className='mt-1 text-xs text-muted-foreground'>
										{t('font.customFontHint')}
									</p>
								</div>
								<FontDropzone
									busy={uploadFont.isPending}
									hint={t('font.dropHint')}
									label={t('font.dropLabel')}
									onFiles={(files) => {
										if (files.length > 2) {
											toast.error(t('font.tooManyFiles'));
											return;
										}
										for (const file of files) {
											performUpload(file);
										}
									}}
								/>
								<div className='rounded-md border'>
									<CustomFontsTable
										boldId={customFontBoldId}
										deleteLabel={t('font.deleteLabel')}
										emptyDescription={t(
											'font.emptyDescription',
										)}
										emptyTitle={t('font.emptyTitle')}
										fileLabel={t('font.fileColumn')}
										fonts={fontsList}
										isFetchingNextPage={
											fontsListQuery.isFetchingNextPage
										}
										isLoading={fontsListQuery.isLoading}
										loadingLabel={t('font.loading')}
										loadingMoreLabel={t('font.loadingMore')}
										onDelete={setFontToDelete}
										onRoleChange={setFontRole}
										onScroll={handleFontsScroll}
										regularId={customFontId}
										roleBoldLabel={t('font.boldShort')}
										roleNoneLabel={t('font.roleNone')}
										roleRegularLabel={t(
											'font.regularShort',
										)}
										styleLabel={t('font.styleColumn')}
									/>
								</div>
							</div>
						</TabsContent>

						<TabsContent className='space-y-4 pt-3' value='global'>
							<NumberField
								control={form.control}
								label={t('global.baseFontSize')}
								max={24}
								min={6}
								name='theme.typography.baseFontSize'
								step={0.5}
							/>
							<NumberField
								control={form.control}
								label={t('global.scale')}
								max={2}
								min={0.5}
								name='theme.typography.scale'
								step={0.05}
							/>
							<NumberField
								control={form.control}
								label={t('global.lineHeight')}
								max={2}
								min={1}
								name='theme.typography.lineHeight'
								step={0.05}
							/>
							<NumberField
								control={form.control}
								label={t('global.letterSpacing')}
								max={5}
								min={-1}
								name='theme.typography.letterSpacing'
								step={0.1}
							/>
						</TabsContent>

						<TabsContent className='pt-3' value='roles'>
							<Accordion collapsible type='single'>
								{TYPOGRAPHY_ROLES.map((role) => (
									<AccordionItem key={role} value={role}>
										<AccordionHeader>
											{tRoles(role)}
										</AccordionHeader>
										<AccordionContent className='space-y-3'>
											<NumberField
												control={form.control}
												label={tRoles('fontSize')}
												max={80}
												min={6}
												name={`theme.typography.roles.${role}.fontSize`}
												step={0.5}
											/>
											<Controller
												control={form.control}
												name={`theme.typography.roles.${role}.fontWeight`}
												render={({ field }) => (
													<div className='space-y-1'>
														<Label>
															{tRoles(
																'fontWeight',
															)}
														</Label>
														<Select
															onValueChange={(
																v,
															) =>
																field.onChange(
																	v ===
																		NO_OVERRIDE
																		? undefined
																		: Number(
																				v,
																			),
																)
															}
															value={
																field.value
																	? String(
																			field.value,
																		)
																	: NO_OVERRIDE
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem
																	value={
																		NO_OVERRIDE
																	}
																>
																	{tRoles(
																		'useDefault',
																	)}
																</SelectItem>
																{availableWeights.map(
																	(w) => (
																		<SelectItem
																			key={
																				w
																			}
																			value={String(
																				w,
																			)}
																		>
																			{w}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
													</div>
												)}
											/>
											<Controller
												control={form.control}
												name={`theme.typography.roles.${role}.textTransform`}
												render={({ field }) => (
													<div className='space-y-1'>
														<Label>
															{tRoles(
																'textTransform',
															)}
														</Label>
														<Select
															onValueChange={(
																v,
															) =>
																field.onChange(
																	v ===
																		NO_OVERRIDE
																		? undefined
																		: v,
																)
															}
															value={
																field.value ??
																NO_OVERRIDE
															}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem
																	value={
																		NO_OVERRIDE
																	}
																>
																	{tRoles(
																		'useDefault',
																	)}
																</SelectItem>
																{TEXT_TRANSFORMS.map(
																	(tt) => (
																		<SelectItem
																			key={
																				tt
																			}
																			value={
																				tt
																			}
																		>
																			{tTransform(
																				tt,
																			)}
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
													</div>
												)}
											/>
											<Button
												onClick={() =>
													form.setValue(
														`theme.typography.roles.${role}`,
														{},
														{ shouldDirty: true },
													)
												}
												size='sm'
												type='button'
												variant='ghost'
											>
												{tRoles('reset')}
											</Button>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</TabsContent>

						<TabsContent
							className='space-y-5 pt-3'
							value='openType'
						>
							<p className='text-xs text-muted-foreground'>
								{tFeatures('onlySupported')}
							</p>
							{isLoadingCustomFeatures ? (
								<p className='text-sm text-muted-foreground'>
									{tFeatures('checking')}
								</p>
							) : (
								visibleFeatureGroups.length === 0 && (
									<p className='text-sm text-muted-foreground'>
										{tFeatures('none')}
									</p>
								)
							)}
							{visibleFeatureGroups.map((group) => (
								<div key={group.key}>
									<h4 className='mb-2 text-sm font-semibold text-muted-foreground uppercase'>
										{tFeatures(group.key)}
									</h4>
									<div className='space-y-2'>
										{group.tags.map((tag) => (
											<Controller
												control={form.control}
												key={tag}
												name={`theme.typography.features.${tag}`}
												render={({ field }) => (
													<div className='flex items-center justify-between'>
														<Label
															htmlFor={`feature-${tag}`}
														>
															{tFeatures(tag)}
														</Label>
														<Switch
															checked={
																!!field.value
															}
															id={`feature-${tag}`}
															onCheckedChange={
																field.onChange
															}
														/>
													</div>
												)}
											/>
										))}
									</div>
								</div>
							))}
						</TabsContent>
					</Tabs>

					<Button
						onClick={() =>
							form.setValue(
								'theme.typography',
								DEFAULT_TYPOGRAPHY,
								{
									shouldDirty: true,
								},
							)
						}
						type='button'
						variant='outline'
					>
						{t('resetAll')}
					</Button>
				</DialogContent>
			</Dialog>

			<AlertDialog
				onOpenChange={(next) => {
					if (!next) resolveOverwrite(false);
				}}
				open={!!currentOverwrite}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t('font.overwriteTitle')}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t('font.overwriteDescription', {
								fileName: currentOverwrite?.file.name ?? '',
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{tCommon('cancel')}
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => resolveOverwrite(true)}
						>
							{t('font.overwriteConfirm')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				onOpenChange={(next) => {
					if (!next) setFontToDelete(undefined);
				}}
				open={!!fontToDelete}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t('font.deleteTitle')}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t('font.deleteDescription', {
								fileName: fontToDelete?.originalFileName ?? '',
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{tCommon('cancel')}
						</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete}>
							{t('font.deleteConfirm')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

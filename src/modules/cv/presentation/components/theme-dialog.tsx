'use client';

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from '@/shared/ui';
import { useTranslations } from 'next-intl';
import {
	type Control,
	Controller,
	type FieldPath,
	type UseFormReturn,
} from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { DEFAULT_TEMPLATE } from '../../domain/entities/template-config';

interface ThemeDialogProps {
	form: UseFormReturn<CvData>;
	onOpenChange: (open: boolean) => void;
	open: boolean;
}

/** Hex color field: a native color swatch (visual pick) kept in sync with a text input (exact value/paste). */
function ColorField({
	control,
	label,
	name,
}: {
	control: Control<CvData>;
	label: string;
	name: FieldPath<CvData>;
}) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				const value =
					typeof field.value === 'string' ? field.value : '#000000';
				return (
					<div className='flex items-center justify-between gap-3'>
						<Label>{label}</Label>
						<div className='flex items-center gap-2'>
							<input
								aria-label={label}
								className='size-8 shrink-0 cursor-pointer rounded border'
								onChange={(e) => field.onChange(e.target.value)}
								type='color'
								value={value}
							/>
							<Input
								className='w-28 uppercase'
								onChange={(e) => field.onChange(e.target.value)}
								value={value}
							/>
						</div>
					</div>
				);
			}}
		/>
	);
}

/** Numeric field bound to a `Controller`, parsing the raw input back to a number (or `undefined` while empty/invalid). */
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
	step?: number;
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
						onBlur={() => {
							if (typeof field.value === 'number') {
								field.onChange(
									Math.min(max, Math.max(min, field.value)),
								);
							}
						}}
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

/** Colors + sidebar width + main content top padding (Fase 5) — the rest of `theme` (fonts) lives in `TypographyDialog`. */
export function ThemeDialog({ form, onOpenChange, open }: ThemeDialogProps) {
	const t = useTranslations('theme');

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<ColorField
						control={form.control}
						label={t('accent')}
						name='theme.colors.accent'
					/>
					<ColorField
						control={form.control}
						label={t('sidebarBg')}
						name='theme.colors.sidebarBg'
					/>
					<ColorField
						control={form.control}
						label={t('muted')}
						name='theme.colors.muted'
					/>
					<Controller
						control={form.control}
						name='theme.sidebarWidth'
						render={({ field }) => (
							<div className='space-y-1'>
								<Label>{t('sidebarWidth')}</Label>
								<Input
									max={45}
									min={20}
									onBlur={() => {
										if (typeof field.value === 'number') {
											field.onChange(
												Math.min(
													45,
													Math.max(20, field.value),
												),
											);
										}
									}}
									onChange={(e) => {
										const next = e.target.valueAsNumber;
										field.onChange(
											Number.isNaN(next)
												? undefined
												: next,
										);
									}}
									type='number'
									value={
										typeof field.value === 'number'
											? field.value
											: ''
									}
								/>
							</div>
						)}
					/>
					<NumberField
						control={form.control}
						label={t('mainTopPadding')}
						max={3}
						min={0}
						name='theme.mainTopPadding'
						step={0.1}
					/>
				</div>

				<Button
					onClick={() =>
						form.setValue(
							'theme',
							{
								...DEFAULT_TEMPLATE,
								typography: form.getValues('theme.typography'),
							},
							{ shouldDirty: true },
						)
					}
					type='button'
					variant='outline'
				>
					{t('resetAll')}
				</Button>
			</DialogContent>
		</Dialog>
	);
}

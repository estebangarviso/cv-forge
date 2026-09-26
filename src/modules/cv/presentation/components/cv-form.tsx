'use client';

import {
	Accordion,
	AccordionContent,
	AccordionHeader,
	AccordionItem,
} from '@shared/ui/primitives/accordion';
import { Button } from '@shared/ui/primitives/button';
import { Input } from '@shared/ui/primitives/input';
import { Label } from '@shared/ui/primitives/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@shared/ui/primitives/select';
import { Textarea } from '@shared/ui/primitives/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { OTHER_ICON_OPTIONS } from '../../domain/entities/cv-data';
import { BulletsField } from './bullets-field';
import { CvFormEntryList } from './cv-form-entry-list';
import { CvFormSkillList } from './cv-form-skill-list';
import {
	DragHandle,
	RemoveEntryButton,
	SortableFieldArray,
} from './cv-form-sortable';

interface CvFormProps {
	form: UseFormReturn<CvData>;
	onSubmit: (data: CvData) => void;
}

// order matches the form's own section order — also the "all expanded" default.
const SECTION_KEYS = [
	'personal',
	'aboutMe',
	'experience',
	'education',
	'courses',
	'extracurricular',
	'skills',
	'languages',
	'references',
	'other',
] as const;
const ACCORDION_STORAGE_KEY = 'cv-form-accordion-state';

/** Reads which sections were open last time from `sessionStorage` — falls back to every section open (SSR, first visit, or corrupt/legacy stored value). */
function readStoredOpenSections(): string[] {
	if (typeof window === 'undefined') return [...SECTION_KEYS];
	try {
		const raw = window.sessionStorage.getItem(ACCORDION_STORAGE_KEY);
		if (!raw) return [...SECTION_KEYS];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((v): v is string => typeof v === 'string')
			: [...SECTION_KEYS];
	} catch {
		return [...SECTION_KEYS];
	}
}

export function CvForm({ form, onSubmit }: CvFormProps) {
	const t = useTranslations('cvForm');
	const {
		formState: { errors },
		handleSubmit,
		register,
	} = form;

	const experience = useFieldArray({
		control: form.control,
		name: 'experience',
	});
	const references = useFieldArray({
		control: form.control,
		name: 'references',
	});
	const other = useFieldArray({ control: form.control, name: 'other' });

	const [openSections, setOpenSections] = useState<string[]>(
		readStoredOpenSections,
	);

	// sessionStorage (not localStorage) — which sections are expanded is a
	// per-tab editing convenience, not a preference worth persisting forever.
	useEffect(() => {
		window.sessionStorage.setItem(
			ACCORDION_STORAGE_KEY,
			JSON.stringify(openSections),
		);
	}, [openSections]);

	return (
		<form className='space-y-6 pr-4' onSubmit={handleSubmit(onSubmit)}>
			<Accordion
				onValueChange={setOpenSections}
				type='multiple'
				value={openSections}
			>
				{/* Personal Info */}
				<AccordionItem value='personal'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('personal')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='name'>{t('name')}</Label>
								<Controller
									control={form.control}
									name='name'
									render={({ field }) => (
										<Input id='name' {...field} />
									)}
								/>
								{errors.name && (
									<p className='mt-1 text-xs text-destructive'>
										{errors.name.message}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor='title'>{t('title')}</Label>
								<Controller
									control={form.control}
									name='title'
									render={({ field }) => (
										<Input id='title' {...field} />
									)}
								/>
							</div>
							<div>
								<Label htmlFor='email'>{t('email')}</Label>
								<div className='relative'>
									<Mail className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Controller
										control={form.control}
										name='email'
										render={({ field }) => (
											<Input
												className='pl-9'
												id='email'
												type='email'
												{...field}
											/>
										)}
									/>
								</div>
							</div>
							<div>
								<Label htmlFor='phone'>{t('phone')}</Label>
								<div className='relative'>
									<Phone className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Controller
										control={form.control}
										name='phone'
										render={({ field }) => (
											<Input
												className='pl-9'
												id='phone'
												{...field}
											/>
										)}
									/>
								</div>
							</div>
							<div className='col-span-2'>
								<Label htmlFor='address'>{t('address')}</Label>
								<div className='relative'>
									<MapPin className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Controller
										control={form.control}
										name='address'
										render={({ field }) => (
											<Input
												className='pl-9'
												id='address'
												{...field}
											/>
										)}
									/>
								</div>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* About Me */}
				<AccordionItem value='aboutMe'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('aboutMe')}
					</AccordionHeader>
					<AccordionContent
						className='in-data-[state=closed]:hidden'
						forceMount
					>
						<Controller
							control={form.control}
							name='aboutMe'
							render={({ field }) => (
								<Textarea rows={3} {...field} />
							)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Experience */}
				<AccordionItem value='experience'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('experience')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<SortableFieldArray
							emptyValue={{
								bullets: [''],
								details: '',
								role: '',
							}}
							fields={experience.fields}
							insert={experience.insert}
							insertLabel={t('add')}
							move={experience.move}
							renderItem={(i, handleProps) => (
								<div className='space-y-2 rounded border p-3'>
									<div className='flex items-center gap-2'>
										<DragHandle {...handleProps} />
										<Input
											placeholder={t('role')}
											{...register(
												`experience.${i}.role`,
											)}
											className='flex-1'
										/>
										<RemoveEntryButton
											onClick={() => experience.remove(i)}
										/>
									</div>
									<Input
										placeholder={t('details')}
										{...register(`experience.${i}.details`)}
									/>
									<BulletsField
										control={form.control}
										jobIndex={i}
										setValue={form.setValue}
									/>
								</div>
							)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Education */}
				<AccordionItem value='education'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('education')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<CvFormEntryList
							addLabel={t('add')}
							form={form}
							name='education'
							subtitleLabel={t('entrySubtitle')}
							titleLabel={t('entryTitle')}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Courses */}
				<AccordionItem value='courses'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('courses')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<CvFormEntryList
							addLabel={t('add')}
							form={form}
							name='courses'
							subtitleLabel={t('entrySubtitle')}
							titleLabel={t('entryTitle')}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Extracurricular */}
				<AccordionItem value='extracurricular'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('extracurricular')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<CvFormEntryList
							addLabel={t('add')}
							form={form}
							name='extracurricular'
							subtitleLabel={t('entrySubtitle')}
							titleLabel={t('entryTitle')}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Skills */}
				<AccordionItem value='skills'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('skills')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<CvFormSkillList
							addLabel={t('add')}
							form={form}
							labelPlaceholder={t('skillLabel')}
							name='skills'
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Languages */}
				<AccordionItem value='languages'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('languages')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<CvFormSkillList
							addLabel={t('add')}
							form={form}
							labelPlaceholder={t('skillLabel')}
							name='languages'
						/>
					</AccordionContent>
				</AccordionItem>

				{/* References */}
				<AccordionItem value='references'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('references')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<SortableFieldArray
							emptyValue={{
								email: '',
								name: '',
								phone: '',
							}}
							fields={references.fields}
							insert={references.insert}
							insertLabel={t('add')}
							move={references.move}
							renderItem={(i, handleProps) => (
								<div className='flex items-center gap-2'>
									<DragHandle {...handleProps} />
									<Input
										placeholder={t('refName')}
										{...register(`references.${i}.name`)}
									/>
									<Input
										placeholder={t('refEmail')}
										{...register(`references.${i}.email`)}
									/>
									<Input
										placeholder={t('refPhone')}
										{...register(`references.${i}.phone`)}
									/>
									<RemoveEntryButton
										onClick={() => references.remove(i)}
									/>
								</div>
							)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* Other */}
				<AccordionItem value='other'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('other')}
					</AccordionHeader>
					<AccordionContent
						className='space-y-3 in-data-[state=closed]:hidden'
						forceMount
					>
						<SortableFieldArray
							emptyValue={{
								icon: 'auto',
								label: '',
								value: '',
							}}
							fields={other.fields}
							insert={other.insert}
							insertLabel={t('add')}
							move={other.move}
							renderItem={(i, handleProps) => (
								<div className='flex items-center gap-2'>
									<DragHandle {...handleProps} />
									<Controller
										control={form.control}
										name={`other.${i}.icon`}
										render={({ field: iconField }) => (
											<Select
												onValueChange={
													iconField.onChange
												}
												value={iconField.value}
											>
												<SelectTrigger className='w-28 shrink-0'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{OTHER_ICON_OPTIONS.map(
														(icon) => (
															<SelectItem
																key={icon}
																value={icon}
															>
																{t(
																	`otherIcon.${icon}`,
																)}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										)}
									/>
									<Input
										placeholder={t('otherLabel')}
										{...register(`other.${i}.label`)}
									/>
									<Input
										placeholder={t('otherValue')}
										{...register(`other.${i}.value`)}
									/>
									<RemoveEntryButton
										onClick={() => other.remove(i)}
									/>
								</div>
							)}
						/>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Button className='w-full print:hidden' type='submit'>
				{t('save')}
			</Button>
		</form>
	);
}

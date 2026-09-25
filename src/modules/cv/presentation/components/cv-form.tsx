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
import { Slider } from '@shared/ui/primitives/slider';
import { Textarea } from '@shared/ui/primitives/textarea';
import { GripVertical, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useEffect, useState } from 'react';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { OTHER_ICON_OPTIONS } from '../../domain/entities/cv-data';
import { BulletsField } from './bullets-field';
import { InsertDivider } from './insert-divider';

interface CvFormProps {
	form: UseFormReturn<CvData>;
	onSubmit: (data: CvData) => void;
}

interface SortableItemProps {
	children: (
		handleProps: React.HTMLAttributes<HTMLElement>,
	) => React.ReactNode;
	id: string;
}

function SortableItem({ children, id }: SortableItemProps) {
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

function makeDragEnd(
	move: (from: number, to: number) => void,
	fields: Array<{ id: string }>,
) {
	return ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const from = fields.findIndex((f) => f.id === active.id);
		const to = fields.findIndex((f) => f.id === over.id);
		if (from !== -1 && to !== -1) move(from, to);
	};
}

interface FieldArrayListProps<T> {
	emptyValue: T;
	fields: { id: string }[];
	insert: (index: number, value: T) => void;
	insertLabel: string;
	renderItem: (field: { id: string }, index: number) => React.ReactNode;
}

/** Interleaves an `InsertDivider` before the first item and after every item, so a field array can grow at any position — replaces a single header button that only ever appended at the end. */
function FieldArrayList<T>({
	emptyValue,
	fields,
	insert,
	insertLabel,
	renderItem,
}: FieldArrayListProps<T>) {
	return (
		<>
			<InsertDivider
				label={insertLabel}
				onInsert={() => insert(0, emptyValue)}
			/>
			{fields.map((field, i) => (
				<Fragment key={field.id}>
					{renderItem(field, i)}
					<InsertDivider
						label={insertLabel}
						onInsert={() => insert(i + 1, emptyValue)}
					/>
				</Fragment>
			))}
		</>
	);
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
	const education = useFieldArray({
		control: form.control,
		name: 'education',
	});
	const courses = useFieldArray({ control: form.control, name: 'courses' });
	const extracurricular = useFieldArray({
		control: form.control,
		name: 'extracurricular',
	});
	const skills = useFieldArray({ control: form.control, name: 'skills' });
	const languages = useFieldArray({
		control: form.control,
		name: 'languages',
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

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

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
					<AccordionContent className='space-y-3' forceMount>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<Label htmlFor='name'>{t('name')}</Label>
								<Input id='name' {...register('name')} />
								{errors.name && (
									<p className='mt-1 text-xs text-destructive'>
										{errors.name.message}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor='title'>{t('title')}</Label>
								<Input id='title' {...register('title')} />
							</div>
							<div>
								<Label htmlFor='email'>{t('email')}</Label>
								<div className='relative'>
									<Mail className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Input
										id='email'
										type='email'
										{...register('email')}
										className='pl-9'
									/>
								</div>
							</div>
							<div>
								<Label htmlFor='phone'>{t('phone')}</Label>
								<div className='relative'>
									<Phone className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Input
										id='phone'
										{...register('phone')}
										className='pl-9'
									/>
								</div>
							</div>
							<div className='col-span-2'>
								<Label htmlFor='address'>{t('address')}</Label>
								<div className='relative'>
									<MapPin className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
									<Input
										id='address'
										{...register('address')}
										className='pl-9'
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
					<AccordionContent forceMount>
						<Textarea {...register('aboutMe')} rows={3} />
					</AccordionContent>
				</AccordionItem>

				{/* Experience */}
				<AccordionItem value='experience'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('experience')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								experience.move,
								experience.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={experience.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										bullets: [''],
										details: '',
										role: '',
									}}
									fields={experience.fields}
									insert={experience.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='space-y-2 rounded border p-3'>
													<div className='flex items-center gap-2'>
														<button
															className='cursor-grab text-muted-foreground hover:text-foreground'
															type='button'
															{...handleProps}
														>
															<GripVertical className='size-4' />
														</button>
														<Input
															placeholder={t(
																'role',
															)}
															{...register(
																`experience.${i}.role`,
															)}
															className='flex-1'
														/>
														<Button
															onClick={() =>
																experience.remove(
																	i,
																)
															}
															size='sm'
															type='button'
															variant='ghost'
														>
															✕
														</Button>
													</div>
													<Input
														placeholder={t(
															'details',
														)}
														{...register(
															`experience.${i}.details`,
														)}
													/>
													<BulletsField
														control={form.control}
														jobIndex={i}
														setValue={form.setValue}
													/>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Education */}
				<AccordionItem value='education'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('education')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								education.move,
								education.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={education.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										subtitle: '',
										title: '',
									}}
									fields={education.fields}
									insert={education.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='flex items-center gap-2'>
													<button
														className='cursor-grab text-muted-foreground hover:text-foreground'
														type='button'
														{...handleProps}
													>
														<GripVertical className='size-4' />
													</button>
													<Input
														placeholder={t(
															'entryTitle',
														)}
														{...register(
															`education.${i}.title`,
														)}
													/>
													<Input
														placeholder={t(
															'entrySubtitle',
														)}
														{...register(
															`education.${i}.subtitle`,
														)}
													/>
													<Button
														onClick={() =>
															education.remove(i)
														}
														size='sm'
														type='button'
														variant='ghost'
													>
														✕
													</Button>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Courses */}
				<AccordionItem value='courses'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('courses')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								courses.move,
								courses.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={courses.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										subtitle: '',
										title: '',
									}}
									fields={courses.fields}
									insert={courses.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='flex items-center gap-2'>
													<button
														className='cursor-grab text-muted-foreground hover:text-foreground'
														type='button'
														{...handleProps}
													>
														<GripVertical className='size-4' />
													</button>
													<Input
														placeholder={t(
															'entryTitle',
														)}
														{...register(
															`courses.${i}.title`,
														)}
													/>
													<Input
														placeholder={t(
															'entrySubtitle',
														)}
														{...register(
															`courses.${i}.subtitle`,
														)}
													/>
													<Button
														onClick={() =>
															courses.remove(i)
														}
														size='sm'
														type='button'
														variant='ghost'
													>
														✕
													</Button>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Extracurricular */}
				<AccordionItem value='extracurricular'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('extracurricular')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								extracurricular.move,
								extracurricular.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={extracurricular.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										subtitle: '',
										title: '',
									}}
									fields={extracurricular.fields}
									insert={extracurricular.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='flex items-center gap-2'>
													<button
														className='cursor-grab text-muted-foreground hover:text-foreground'
														type='button'
														{...handleProps}
													>
														<GripVertical className='size-4' />
													</button>
													<Input
														placeholder={t(
															'entryTitle',
														)}
														{...register(
															`extracurricular.${i}.title`,
														)}
													/>
													<Input
														placeholder={t(
															'entrySubtitle',
														)}
														{...register(
															`extracurricular.${i}.subtitle`,
														)}
													/>
													<Button
														onClick={() =>
															extracurricular.remove(
																i,
															)
														}
														size='sm'
														type='button'
														variant='ghost'
													>
														✕
													</Button>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Skills */}
				<AccordionItem value='skills'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('skills')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(skills.move, skills.fields)}
							sensors={sensors}
						>
							<SortableContext
								items={skills.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{ label: '', level: 50 }}
									fields={skills.fields}
									insert={skills.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='space-y-1 rounded border p-3'>
													<div className='flex items-center gap-2'>
														<button
															className='cursor-grab text-muted-foreground hover:text-foreground'
															type='button'
															{...handleProps}
														>
															<GripVertical className='size-4' />
														</button>
														<Input
															placeholder={t(
																'skillLabel',
															)}
															{...register(
																`skills.${i}.label`,
															)}
															className='flex-1'
														/>
														<Button
															onClick={() =>
																skills.remove(i)
															}
															size='sm'
															type='button'
															variant='ghost'
														>
															✕
														</Button>
													</div>
													<div className='flex items-center gap-3'>
														<Controller
															control={
																form.control
															}
															name={`skills.${i}.level`}
															render={({
																field: {
																	onChange,
																	value,
																},
															}) => (
																<>
																	<Slider
																		className='flex-1'
																		max={
																			100
																		}
																		min={0}
																		onValueChange={([
																			v,
																		]) =>
																			onChange(
																				v,
																			)
																		}
																		step={1}
																		value={[
																			value,
																		]}
																	/>
																	<span className='w-8 text-right text-xs text-muted-foreground'>
																		{value}%
																	</span>
																</>
															)}
														/>
													</div>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Languages */}
				<AccordionItem value='languages'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('languages')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								languages.move,
								languages.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={languages.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{ label: '', level: 50 }}
									fields={languages.fields}
									insert={languages.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='space-y-1 rounded border p-3'>
													<div className='flex items-center gap-2'>
														<button
															className='cursor-grab text-muted-foreground hover:text-foreground'
															type='button'
															{...handleProps}
														>
															<GripVertical className='size-4' />
														</button>
														<Input
															placeholder={t(
																'skillLabel',
															)}
															{...register(
																`languages.${i}.label`,
															)}
															className='flex-1'
														/>
														<Button
															onClick={() =>
																languages.remove(
																	i,
																)
															}
															size='sm'
															type='button'
															variant='ghost'
														>
															✕
														</Button>
													</div>
													<div className='flex items-center gap-3'>
														<Controller
															control={
																form.control
															}
															name={`languages.${i}.level`}
															render={({
																field: {
																	onChange,
																	value,
																},
															}) => (
																<>
																	<Slider
																		className='flex-1'
																		max={
																			100
																		}
																		min={0}
																		onValueChange={([
																			v,
																		]) =>
																			onChange(
																				v,
																			)
																		}
																		step={1}
																		value={[
																			value,
																		]}
																	/>
																	<span className='w-8 text-right text-xs text-muted-foreground'>
																		{value}%
																	</span>
																</>
															)}
														/>
													</div>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* References */}
				<AccordionItem value='references'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('references')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(
								references.move,
								references.fields,
							)}
							sensors={sensors}
						>
							<SortableContext
								items={references.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										email: '',
										name: '',
										phone: '',
									}}
									fields={references.fields}
									insert={references.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='flex items-center gap-2'>
													<button
														className='cursor-grab text-muted-foreground hover:text-foreground'
														type='button'
														{...handleProps}
													>
														<GripVertical className='size-4' />
													</button>
													<Input
														placeholder={t(
															'refName',
														)}
														{...register(
															`references.${i}.name`,
														)}
													/>
													<Input
														placeholder={t(
															'refEmail',
														)}
														{...register(
															`references.${i}.email`,
														)}
													/>
													<Input
														placeholder={t(
															'refPhone',
														)}
														{...register(
															`references.${i}.phone`,
														)}
													/>
													<Button
														onClick={() =>
															references.remove(i)
														}
														size='sm'
														type='button'
														variant='ghost'
													>
														✕
													</Button>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>

				{/* Other */}
				<AccordionItem value='other'>
					<AccordionHeader className='sticky top-0 z-20 bg-background'>
						{t('other')}
					</AccordionHeader>
					<AccordionContent className='space-y-3' forceMount>
						<DndContext
							collisionDetection={closestCenter}
							onDragEnd={makeDragEnd(other.move, other.fields)}
							sensors={sensors}
						>
							<SortableContext
								items={other.fields.map((f) => f.id)}
								strategy={verticalListSortingStrategy}
							>
								<FieldArrayList
									emptyValue={{
										icon: 'auto',
										label: '',
										value: '',
									}}
									fields={other.fields}
									insert={other.insert}
									insertLabel={t('add')}
									renderItem={(field, i) => (
										<SortableItem
											id={field.id}
											key={field.id}
										>
											{(handleProps) => (
												<div className='flex items-center gap-2'>
													<button
														className='cursor-grab text-muted-foreground hover:text-foreground'
														type='button'
														{...handleProps}
													>
														<GripVertical className='size-4' />
													</button>
													<Controller
														control={form.control}
														name={`other.${i}.icon`}
														render={({
															field: iconField,
														}) => (
															<Select
																onValueChange={
																	iconField.onChange
																}
																value={
																	iconField.value
																}
															>
																<SelectTrigger className='w-28 shrink-0'>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{OTHER_ICON_OPTIONS.map(
																		(
																			icon,
																		) => (
																			<SelectItem
																				key={
																					icon
																				}
																				value={
																					icon
																				}
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
														placeholder={t(
															'otherLabel',
														)}
														{...register(
															`other.${i}.label`,
														)}
													/>
													<Input
														placeholder={t(
															'otherValue',
														)}
														{...register(
															`other.${i}.value`,
														)}
													/>
													<Button
														onClick={() =>
															other.remove(i)
														}
														size='sm'
														type='button'
														variant='ghost'
													>
														✕
													</Button>
												</div>
											)}
										</SortableItem>
									)}
								/>
							</SortableContext>
						</DndContext>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Button className='w-full print:hidden' type='submit'>
				{t('save')}
			</Button>
		</form>
	);
}

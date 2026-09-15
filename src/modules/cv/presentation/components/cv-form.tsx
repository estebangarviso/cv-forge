'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/ui/primitives/button';
import { Input } from '@shared/ui/primitives/input';
import { Label } from '@shared/ui/primitives/label';
import { ScrollArea } from '@shared/ui/primitives/scroll-area';
import { Textarea } from '@shared/ui/primitives/textarea';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';

import { type CvData, CvDataSchema } from '../../domain/entities/cv-data';

interface CvFormProps {
	defaultValues?: Partial<CvData>;
	onChange?: (data: CvData) => void;
	onSubmit: (data: CvData) => void;
}

const EMPTY_CV: CvData = {
	aboutMe: '',
	city: '',
	courses: [],
	education: [],
	email: '',
	experience: [],
	extracurricular: [],
	languages: [],
	name: '',
	phone: '',
	references: [],
	skills: [],
	title: '',
};

export function CvForm({ defaultValues, onChange, onSubmit }: CvFormProps) {
	const t = useTranslations('cvForm');

	const form = useForm<CvData>({
		defaultValues: { ...EMPTY_CV, ...defaultValues },
		mode: 'onChange',
		resolver: zodResolver(CvDataSchema),
	});

	const {
		formState: { errors },
		handleSubmit,
		register,
		watch,
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
	const skills = useFieldArray({ control: form.control, name: 'skills' });
	const languages = useFieldArray({
		control: form.control,
		name: 'languages',
	});
	const references = useFieldArray({
		control: form.control,
		name: 'references',
	});
	const extracurricular = useFieldArray({
		control: form.control,
		name: 'extracurricular',
	});

	// live preview updates
	const watchedData = watch();
	if (onChange) {
		// using watch callback would be better but this works for MVP
	}

	return (
		<ScrollArea className='h-[calc(100vh-8rem)]'>
			<form className='space-y-6 pr-4' onSubmit={handleSubmit(onSubmit)}>
				{/* Personal Info */}
				<fieldset className='space-y-3'>
					<legend className='text-sm font-semibold text-muted-foreground uppercase'>
						{t('personal')}
					</legend>
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
							<Input
								id='email'
								type='email'
								{...register('email')}
							/>
						</div>
						<div>
							<Label htmlFor='phone'>{t('phone')}</Label>
							<Input id='phone' {...register('phone')} />
						</div>
						<div className='col-span-2'>
							<Label htmlFor='city'>{t('city')}</Label>
							<Input id='city' {...register('city')} />
						</div>
					</div>
				</fieldset>

				{/* About Me */}
				<fieldset className='space-y-2'>
					<legend className='text-sm font-semibold text-muted-foreground uppercase'>
						{t('aboutMe')}
					</legend>
					<Textarea {...register('aboutMe')} rows={3} />
				</fieldset>

				{/* Experience */}
				<fieldset className='space-y-3'>
					<div className='flex items-center justify-between'>
						<legend className='text-sm font-semibold text-muted-foreground uppercase'>
							{t('experience')}
						</legend>
						<Button
							onClick={() =>
								experience.append({
									bullets: [''],
									details: '',
									role: '',
								})
							}
							size='sm'
							type='button'
							variant='outline'
						>
							+ {t('add')}
						</Button>
					</div>
					{experience.fields.map((field, i) => (
						<div
							className='space-y-2 rounded border p-3'
							key={field.id}
						>
							<div className='flex justify-between'>
								<Input
									placeholder={t('role')}
									{...register(`experience.${i}.role`)}
								/>
								<Button
									onClick={() => experience.remove(i)}
									size='sm'
									type='button'
									variant='ghost'
								>
									✕
								</Button>
							</div>
							<Input
								placeholder={t('details')}
								{...register(`experience.${i}.details`)}
							/>
							<Textarea
								placeholder={t('bullets')}
								{...register(`experience.${i}.bullets.0`)}
								rows={2}
							/>
						</div>
					))}
				</fieldset>

				{/* Education */}
				<fieldset className='space-y-3'>
					<div className='flex items-center justify-between'>
						<legend className='text-sm font-semibold text-muted-foreground uppercase'>
							{t('education')}
						</legend>
						<Button
							onClick={() =>
								education.append({ subtitle: '', title: '' })
							}
							size='sm'
							type='button'
							variant='outline'
						>
							+ {t('add')}
						</Button>
					</div>
					{education.fields.map((field, i) => (
						<div className='flex gap-2' key={field.id}>
							<Input
								placeholder={t('entryTitle')}
								{...register(`education.${i}.title`)}
							/>
							<Input
								placeholder={t('entrySubtitle')}
								{...register(`education.${i}.subtitle`)}
							/>
							<Button
								onClick={() => education.remove(i)}
								size='sm'
								type='button'
								variant='ghost'
							>
								✕
							</Button>
						</div>
					))}
				</fieldset>

				{/* Skills */}
				<fieldset className='space-y-3'>
					<div className='flex items-center justify-between'>
						<legend className='text-sm font-semibold text-muted-foreground uppercase'>
							{t('skills')}
						</legend>
						<Button
							onClick={() =>
								skills.append({ label: '', level: 50 })
							}
							size='sm'
							type='button'
							variant='outline'
						>
							+ {t('add')}
						</Button>
					</div>
					{skills.fields.map((field, i) => (
						<div className='flex items-center gap-2' key={field.id}>
							<Input
								placeholder={t('skillLabel')}
								{...register(`skills.${i}.label`)}
								className='flex-1'
							/>
							<Input
								max={100}
								min={0}
								type='number'
								{...register(`skills.${i}.level`, {
									valueAsNumber: true,
								})}
								className='w-20'
							/>
							<Button
								onClick={() => skills.remove(i)}
								size='sm'
								type='button'
								variant='ghost'
							>
								✕
							</Button>
						</div>
					))}
				</fieldset>

				{/* References */}
				<fieldset className='space-y-3'>
					<div className='flex items-center justify-between'>
						<legend className='text-sm font-semibold text-muted-foreground uppercase'>
							{t('references')}
						</legend>
						<Button
							onClick={() =>
								references.append({
									email: '',
									name: '',
									phone: '',
								})
							}
							size='sm'
							type='button'
							variant='outline'
						>
							+ {t('add')}
						</Button>
					</div>
					{references.fields.map((field, i) => (
						<div className='grid grid-cols-3 gap-2' key={field.id}>
							<Input
								placeholder={t('refName')}
								{...register(`references.${i}.name`)}
							/>
							<Input
								placeholder={t('refEmail')}
								{...register(`references.${i}.email`)}
							/>
							<div className='flex gap-1'>
								<Input
									placeholder={t('refPhone')}
									{...register(`references.${i}.phone`)}
								/>
								<Button
									onClick={() => references.remove(i)}
									size='sm'
									type='button'
									variant='ghost'
								>
									✕
								</Button>
							</div>
						</div>
					))}
				</fieldset>

				{/* LinkedIn + Driving License */}
				<fieldset className='space-y-3'>
					<legend className='text-sm font-semibold text-muted-foreground uppercase'>
						{t('other')}
					</legend>
					<div>
						<Label htmlFor='linkedinUrl'>LinkedIn URL</Label>
						<Input id='linkedinUrl' {...register('linkedinUrl')} />
					</div>
					<div>
						<Label htmlFor='drivingLicense'>
							{t('drivingLicense')}
						</Label>
						<Input
							id='drivingLicense'
							{...register('drivingLicense')}
						/>
					</div>
				</fieldset>

				<Button className='w-full print:hidden' type='submit'>
					{t('save')}
				</Button>
			</form>
		</ScrollArea>
	);
}

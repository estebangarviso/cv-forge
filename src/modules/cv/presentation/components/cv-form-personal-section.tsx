'use client';

import { Input } from '@shared/ui/primitives/input';
import { Label } from '@shared/ui/primitives/label';
import { type LucideIcon, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type Control, Controller, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

interface CvFormPersonalSectionProps {
	form: UseFormReturn<CvData>;
}

interface IconFieldProps {
	className?: string;
	control: Control<CvData>;
	icon: LucideIcon;
	label: string;
	name: 'address' | 'email' | 'phone';
	type?: string;
}

function IconField({
	className,
	control,
	icon: Icon,
	label,
	name,
	type,
}: IconFieldProps) {
	return (
		<div className={className}>
			<Label htmlFor={name}>{label}</Label>
			<div className='relative'>
				<Icon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
				<Controller
					control={control}
					name={name}
					render={({ field }) => (
						<Input
							className='pl-9'
							id={name}
							type={type}
							{...field}
						/>
					)}
				/>
			</div>
		</div>
	);
}

export function CvFormPersonalSection({ form }: CvFormPersonalSectionProps) {
	const t = useTranslations('cvForm');
	const {
		formState: { errors },
	} = form;

	return (
		<div className='grid grid-cols-2 gap-3'>
			<div>
				<Label htmlFor='name'>{t('name')}</Label>
				<Controller
					control={form.control}
					name='name'
					render={({ field }) => <Input id='name' {...field} />}
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
					render={({ field }) => <Input id='title' {...field} />}
				/>
			</div>
			<IconField
				control={form.control}
				icon={Mail}
				label={t('email')}
				name='email'
				type='email'
			/>
			<IconField
				control={form.control}
				icon={Phone}
				label={t('phone')}
				name='phone'
			/>
			<IconField
				className='col-span-2'
				control={form.control}
				icon={MapPin}
				label={t('address')}
				name='address'
			/>
		</div>
	);
}

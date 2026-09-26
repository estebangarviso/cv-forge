'use client';

import { Accordion } from '@shared/ui/primitives/accordion';
import { Button } from '@shared/ui/primitives/button';
import { Textarea } from '@shared/ui/primitives/textarea';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { CvData } from '../../domain/entities/cv-data';

import { CvFormEntryList } from './cv-form-entry-list';
import { CvFormExperienceSection } from './cv-form-experience-section';
import { CvFormOtherSection } from './cv-form-other-section';
import { CvFormPersonalSection } from './cv-form-personal-section';
import { CvFormReferencesSection } from './cv-form-references-section';
import { CvFormSection } from './cv-form-section';
import { CvFormSkillList } from './cv-form-skill-list';

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
		<form className='space-y-6 pr-4' onSubmit={form.handleSubmit(onSubmit)}>
			<Accordion
				onValueChange={setOpenSections}
				type='multiple'
				value={openSections}
			>
				<CvFormSection title={t('personal')} value='personal'>
					<CvFormPersonalSection form={form} />
				</CvFormSection>

				<CvFormSection title={t('aboutMe')} value='aboutMe'>
					<Controller
						control={form.control}
						name='aboutMe'
						render={({ field }) => <Textarea rows={3} {...field} />}
					/>
				</CvFormSection>

				<CvFormSection title={t('experience')} value='experience'>
					<CvFormExperienceSection form={form} />
				</CvFormSection>

				<CvFormSection title={t('education')} value='education'>
					<CvFormEntryList
						addLabel={t('add')}
						form={form}
						name='education'
						subtitleLabel={t('entrySubtitle')}
						titleLabel={t('entryTitle')}
					/>
				</CvFormSection>

				<CvFormSection title={t('courses')} value='courses'>
					<CvFormEntryList
						addLabel={t('add')}
						form={form}
						name='courses'
						subtitleLabel={t('entrySubtitle')}
						titleLabel={t('entryTitle')}
					/>
				</CvFormSection>

				<CvFormSection
					title={t('extracurricular')}
					value='extracurricular'
				>
					<CvFormEntryList
						addLabel={t('add')}
						form={form}
						name='extracurricular'
						subtitleLabel={t('entrySubtitle')}
						titleLabel={t('entryTitle')}
					/>
				</CvFormSection>

				<CvFormSection title={t('skills')} value='skills'>
					<CvFormSkillList
						addLabel={t('add')}
						form={form}
						labelPlaceholder={t('skillLabel')}
						name='skills'
					/>
				</CvFormSection>

				<CvFormSection title={t('languages')} value='languages'>
					<CvFormSkillList
						addLabel={t('add')}
						form={form}
						labelPlaceholder={t('skillLabel')}
						name='languages'
					/>
				</CvFormSection>

				<CvFormSection title={t('references')} value='references'>
					<CvFormReferencesSection form={form} />
				</CvFormSection>

				<CvFormSection title={t('other')} value='other'>
					<CvFormOtherSection form={form} />
				</CvFormSection>
			</Accordion>

			<Button className='w-full print:hidden' type='submit'>
				{t('save')}
			</Button>
		</form>
	);
}

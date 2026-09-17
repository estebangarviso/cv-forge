import { z } from 'zod';

import { DEFAULT_TEMPLATE, TemplateConfigSchema } from './template-config';

/** Matches `PdfIconName` in `@shared/ui/pdf` (plus `'auto'`/`'none'`) — kept as a plain string union here so domain stays framework-free. */
export const OTHER_ICON_OPTIONS = [
	'auto',
	'none',
	'link',
	'linkedin',
	'mail',
	'phone',
	'pin',
	'idCard',
] as const;
export const OtherIconSchema = z.enum(OTHER_ICON_OPTIONS);
export type OtherIcon = z.infer<typeof OtherIconSchema>;

export const OtherEntrySchema = z.object({
	icon: OtherIconSchema.default('auto'),
	label: z.string().default(''),
	value: z.string().default(''),
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/u;
const PHONE_PATTERN = /^[\d+][\s\d()-]{5,}$/u;

/**
 * Resolves the icon to render for an "other" entry. An explicit (non-`auto`)
 * choice always wins; `auto` sniffs the value's shape (LinkedIn domain,
 * mailto:/email, tel:/phone, http(s) URL) and falls back to no icon.
 */
export function resolveOtherIcon(
	value: string,
	explicitIcon: OtherIcon,
): Exclude<OtherIcon, 'auto'> {
	if (explicitIcon !== 'auto') return explicitIcon;

	const trimmed = value.trim();
	if (/^https?:\/\//iu.test(trimmed)) {
		try {
			const { hostname } = new URL(trimmed);
			if (hostname.replace(/^w{3}\./u, '') === 'linkedin.com')
				return 'linkedin';
		} catch {
			// falls through to the generic 'link' icon below
		}
		return 'link';
	}
	if (/^mailto:/iu.test(trimmed) || EMAIL_PATTERN.test(trimmed))
		return 'mail';
	if (/^tel:/iu.test(trimmed) || PHONE_PATTERN.test(trimmed)) return 'phone';
	return 'none';
}

export const SkillSchema = z.object({
	label: z.string().min(1),
	level: z.number().min(0).max(100),
	subtitle: z.string().optional(),
});

export const SideEntrySchema = z.object({
	subtitle: z.string(),
	title: z.string().min(1),
});

export const JobEntrySchema = z.object({
	bullets: z.array(z.string()),
	details: z.string(),
	role: z.string().min(1),
});

export const RefEntrySchema = z.object({
	email: z.string().email().or(z.literal('')),
	name: z.string().min(1),
	phone: z.string(),
});

export const CvDataSchema = z.object({
	aboutMe: z.string().default(''),
	address: z.string().default(''),
	courses: z.array(SideEntrySchema).default([]),
	createdAt: z.string().datetime().optional(),
	/** Display title of the Drive document (separate from the person's name on the CV). */
	cvTitle: z.string().default(''),
	education: z.array(SideEntrySchema).default([]),
	email: z.string().email().or(z.literal('')).default(''),
	experience: z.array(JobEntrySchema).default([]),
	extracurricular: z.array(SideEntrySchema).default([]),
	id: z.string().optional(),
	languages: z.array(SkillSchema).default([]),
	name: z.string().default(''),
	other: z.array(OtherEntrySchema).default([]),
	phone: z.string().default(''),
	references: z.array(RefEntrySchema).default([]),
	skills: z.array(SkillSchema).default([]),
	/** Per-CV template config (colors, layout, typography) — defaults keep older Drive files without this field working unchanged. */
	theme: TemplateConfigSchema.default(DEFAULT_TEMPLATE),
	title: z.string().default(''),
	updatedAt: z.string().datetime().optional(),
});

export type CvData = z.infer<typeof CvDataSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SideEntry = z.infer<typeof SideEntrySchema>;
export type JobEntry = z.infer<typeof JobEntrySchema>;
export type RefEntry = z.infer<typeof RefEntrySchema>;
export type OtherEntry = z.infer<typeof OtherEntrySchema>;

export const EMPTY_CV: CvData = {
	aboutMe: '',
	address: '',
	courses: [],
	cvTitle: '',
	education: [],
	email: '',
	experience: [],
	extracurricular: [],
	languages: [],
	name: '',
	other: [],
	phone: '',
	references: [],
	skills: [],
	theme: DEFAULT_TEMPLATE,
	title: '',
};

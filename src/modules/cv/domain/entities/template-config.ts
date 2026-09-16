import { z } from 'zod';

/** react-pdf supports OpenType feature flags (smcp, liga, onum, tnum, ss01-ss20…) but NOT variable-font axes (wght/wdth/GRAD…) — verified against @react-pdf/stylesheet's TextStyle type. Kept as a loose string→boolean record so the UI can expose any subset without the schema hardcoding the full OpenType tag list. */
export const TypographyFeaturesSchema = z.record(z.string(), z.boolean());
export type TypographyFeatures = z.infer<typeof TypographyFeaturesSchema>;

export const TYPOGRAPHY_ROLES = [
	'name',
	'jobTitle',
	'sectionHeading',
	'sidebarHeading',
	'body',
	'meta',
	'contactPhone',
	'contactEmail',
	'contactAddress',
] as const;
export const TypographyRoleSchema = z.enum(TYPOGRAPHY_ROLES);
export type TypographyRole = z.infer<typeof TypographyRoleSchema>;

/** All optional — a role only overrides what's set here; everything else falls back to the role's default ratio of `baseFontSize` and the global lineHeight/letterSpacing/features. `textTransform` is intentionally NOT defaulted per role (e.g. a job entry's role text and the person's own title share the `jobTitle` role but differ on uppercase) — components keep their own structural default and only apply this when explicitly set. */
export const TypographyRoleOverrideSchema = z.object({
	features: TypographyFeaturesSchema.optional(),
	fontSize: z.number().positive().optional(),
	fontWeight: z.union([z.number(), z.string()]).optional(),
	letterSpacing: z.number().optional(),
	lineHeight: z.number().positive().optional(),
	textTransform: z
		.enum(['capitalize', 'lowercase', 'none', 'upperfirst', 'uppercase'])
		.optional(),
});
export type TypographyRoleOverride = z.infer<
	typeof TypographyRoleOverrideSchema
>;

export const TypographySchema = z.object({
	/** Reference size (pt) each role's default ratio multiplies against — also the `<Page>`'s own base `fontSize`. */
	baseFontSize: z.number().positive().default(10),
	/** Drive fileId of an optional companion bold (700) weight for the SAME uploaded family — ignored unless `customFontId` is also set. */
	customFontBoldId: z.string().optional(),
	/** Drive fileId of a user-uploaded font's regular (400) weight (Fase 4) — takes priority over `fontFamily` once registered. */
	customFontId: z.string().optional(),
	features: TypographyFeaturesSchema.default({}),
	/** Fallback family name — must match a family already passed to `Font.register` in `@shared/ui/pdf/fonts.ts`. */
	fontFamily: z.string().default('Noto Sans'),
	letterSpacing: z.number().default(0),
	lineHeight: z.number().positive().default(1.35),
	roles: z
		.object({
			body: TypographyRoleOverrideSchema.optional(),
			contactAddress: TypographyRoleOverrideSchema.optional(),
			contactEmail: TypographyRoleOverrideSchema.optional(),
			contactPhone: TypographyRoleOverrideSchema.optional(),
			jobTitle: TypographyRoleOverrideSchema.optional(),
			meta: TypographyRoleOverrideSchema.optional(),
			name: TypographyRoleOverrideSchema.optional(),
			sectionHeading: TypographyRoleOverrideSchema.optional(),
			sidebarHeading: TypographyRoleOverrideSchema.optional(),
		})
		.default({}),
	/** Global multiplier applied on top of every resolved role size, for a quick "bigger/smaller" control. */
	scale: z.number().min(0.5).max(2).default(1),
});
export type Typography = z.infer<typeof TypographySchema>;

export const DEFAULT_TYPOGRAPHY: Typography = TypographySchema.parse({});

/** Plain, framework-agnostic style shape — happens to line up with react-pdf's TextStyle properties by convention (like `colors` already does), not by importing react-pdf into the domain layer. Bridged to react-pdf's own `Style` type in the presentation layer via `resolvePdfTypography` (see `modules/cv/presentation/lib/resolve-pdf-typography.ts`). */
export interface ResolvedTypographyStyle {
	fontFamily: string;
	fontFeatureSettings?: TypographyFeatures;
	fontSize: number;
	fontWeight?: number | string;
	letterSpacing?: number;
	lineHeight: number;
	textTransform?: TypographyRoleOverride['textTransform'];
}

/** Default fontSize ratio (of `baseFontSize`), fontWeight, and (where the design calls for it) letterSpacing per role, reproducing today's hardcoded CV look at the default `baseFontSize: 10`. */
const ROLE_DEFAULTS: Record<
	TypographyRole,
	{ letterSpacing?: number; ratio: number; weight: number }
> = {
	body: { ratio: 0.9, weight: 400 },
	contactAddress: { ratio: 0.8, weight: 400 },
	contactEmail: { ratio: 0.8, weight: 400 },
	contactPhone: { ratio: 0.8, weight: 400 },
	jobTitle: { ratio: 1.05, weight: 400 },
	meta: { ratio: 0.8, weight: 400 },
	name: { ratio: 3.8, weight: 700 },
	sectionHeading: { ratio: 1.2, weight: 700 },
	sidebarHeading: { letterSpacing: 1.5, ratio: 0.95, weight: 700 },
};

/**
 * Resolves a CV's typography config into one style object per role. `scale`
 * multiplies every resolved fontSize; a role's explicit override always wins
 * over its computed default; `features`/`lineHeight` fall back role → global;
 * `letterSpacing` falls back role override → role default → global.
 */
export function resolveTypography(
	typography: Typography,
): Record<TypographyRole, ResolvedTypographyStyle> {
	const fontFamily = typography.customFontId
		? `custom-${typography.customFontId}`
		: typography.fontFamily;

	return Object.fromEntries(
		TYPOGRAPHY_ROLES.map((role) => {
			const roleDefaults = ROLE_DEFAULTS[role];
			const override = typography.roles[role];
			const fontSize =
				(override?.fontSize ??
					typography.baseFontSize * roleDefaults.ratio) *
				typography.scale;
			const style: ResolvedTypographyStyle = {
				fontFamily,
				fontFeatureSettings: override?.features ?? typography.features,
				fontSize,
				fontWeight: override?.fontWeight ?? roleDefaults.weight,
				letterSpacing:
					override?.letterSpacing ??
					roleDefaults.letterSpacing ??
					typography.letterSpacing,
				lineHeight: override?.lineHeight ?? typography.lineHeight,
			};
			if (override?.textTransform)
				style.textTransform = override.textTransform;
			return [role, style];
		}),
	) as Record<TypographyRole, ResolvedTypographyStyle>;
}

export const TemplateConfigSchema = z.object({
	colors: z.object({
		accent: z.string(),
		muted: z.string(),
		sidebarBg: z.string(),
	}),
	id: z.string(),
	/** Space (cm) between the header band (name/title) and the first main-column section (e.g. work experience). */
	mainTopPadding: z.number().min(0).max(3).default(0),
	name: z.string(),
	sidebarWidth: z.number().min(20).max(45).default(29),
	typography: TypographySchema.default(DEFAULT_TYPOGRAPHY),
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

export const DEFAULT_TEMPLATE: TemplateConfig = {
	colors: { accent: '#1A1A2E', muted: '#555555', sidebarBg: '#D4EDEC' },
	id: 'classic-teal-v1',
	mainTopPadding: 0,
	name: 'Profesional Teal',
	sidebarWidth: 29,
	typography: DEFAULT_TYPOGRAPHY,
};

import type { ViewProps } from '@shared/ui/pdf';

import type {
	Typography,
	TypographyRole,
} from '../../domain/entities/template-config';

import {
	resolveTypography,
	TYPOGRAPHY_ROLES,
} from '../../domain/entities/template-config';

// `ViewProps['style']` (plain `StyleProp`) rather than `TextProps['style']`
// (which also allows `SVGPresentationAttributes` for text-in-SVG use) — the
// wider Text union doesn't compose inside a `[styleA, styleB]` style array.
type PdfTextStyle = ViewProps['style'];

/**
 * Presentation-layer bridge: `resolveTypography` returns a plain,
 * framework-agnostic style shape (domain stays react-pdf-free); react-pdf's
 * own `Style` type has a template-literal `@media${string}` index signature
 * that TypeScript can't structurally verify against a plain domain
 * interface, so the cast happens once per role here instead of at every JSX
 * `style` prop.
 */
export function resolvePdfTypography(
	typography: Typography,
): Record<TypographyRole, PdfTextStyle> {
	const resolved = resolveTypography(typography);
	return Object.fromEntries(
		TYPOGRAPHY_ROLES.map((role) => [
			role,
			resolved[role] as unknown as PdfTextStyle,
		]),
	) as Record<TypographyRole, PdfTextStyle>;
}

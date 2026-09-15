import { Font } from '@react-pdf/renderer';

// react-pdf's FontStore.resolve() filters registered faces by EXACT
// fontStyle/fontWeight and throws if nothing matches — a face registered
// without them (both `undefined`) never matches the concrete 'normal'/400
// react-pdf always resolves against, so every custom font face MUST declare
// both explicitly, even the common single-weight case.
const registered = new Set<string>();

/**
 * Registers one weight/style face of a user-uploaded font (Fase 4) under
 * `family`; safe to call more than once for the same `id` — a no-op after
 * the first. A regular + bold pair for the SAME uploaded font must share
 * `family` (`` `custom-${regularId}` ``, see `resolveTypography`) so
 * react-pdf can pick the right face per role's resolved `fontWeight`.
 */
export function registerCustomFont(
	id: string,
	family: string,
	mimeType: string,
	base64Content: string,
	fontWeight: 400 | 700 = 400,
): void {
	if (registered.has(id)) return;
	Font.register({
		family,
		fontStyle: 'normal',
		fontWeight,
		src: `data:${mimeType};base64,${base64Content}`,
	});
	registered.add(id);
}

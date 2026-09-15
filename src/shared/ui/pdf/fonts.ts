import { Font } from '@react-pdf/renderer';

import { PDF_FONTS } from './pdf-fonts.config.mjs';

// self-hosted from public/fonts/ (see copy-pdf-fonts.mjs) — no external CDN
// at PDF-generation time. Add fonts in pdf-fonts.config.mjs, not here.
// .woff (not .woff2): fontkit's woff2/brotli decoder is unreliable in this
// bundler runtime and throws "RangeError: Offset is outside the bounds of
// the DataView"; plain .woff decodes without that WASM dependency.
for (const {
	family,
	fontsourceId,
	styles = ['normal'],
	subset,
	weights,
} of PDF_FONTS) {
	Font.register({
		family,
		fonts: weights.flatMap((fontWeight) =>
			styles.map((fontStyle) => ({
				fontStyle: fontStyle as 'italic' | 'normal',
				fontWeight,
				src: `/fonts/${fontsourceId}/${fontsourceId}-${subset}-${fontWeight}-${fontStyle}.woff`,
			})),
		),
	});
}

// keep words intact — the default hyphenation callback can insert awkward
// mid-word breaks in narrow columns (e.g. the CV sidebar).
Font.registerHyphenationCallback((word) => [word]);

export { DEFAULT_PDF_FONT_FAMILY as PDF_FONT_FAMILY } from './pdf-fonts.config.mjs';

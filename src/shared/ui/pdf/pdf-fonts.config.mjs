/**
 * Single source of truth for which @fontsource/* packages back the PDF
 * renderer's fonts. Add a font: `pnpm add -D @fontsource/<name>`, add an
 * entry below, then run `pnpm pdf-fonts:copy`. Nothing else needs to change
 * — `fonts.ts` registers every entry generically and `copy-pdf-fonts.mjs`
 * copies every entry's static files into `public/fonts/<fontsourceId>/`.
 *
 * @typedef {object} PdfFontConfig
 * @property {string} family - Family name exposed to react-pdf (`Font.register` / `StyleSheet` `fontFamily`).
 * @property {string} fontsourceId - `@fontsource/<fontsourceId>` package folder name.
 * @property {string} subset - Fontsource subset to use (e.g. `'latin'`).
 * @property {number[]} weights - Weights to register; must exist as static files in the package.
 * @property {Array<'normal' | 'italic'>} [styles] - Styles to register. Defaults to `['normal']`.
 * @property {string[]} features - OpenType GSUB/GPOS tags this font's REGULAR weight file actually implements — verified with fontkit (`font.availableFeatures`), never guessed. Drives which toggles the typography dialog's OpenType tab shows for this font; see `react-pdf-cv-rendering` skill for the exact inspection command.
 */

/** @type {PdfFontConfig[]} */
export const PDF_FONTS = [
	{
		// default app font — not a Tahoma substitute here, see the dedicated
		// 'Tahoma' entry below for that; kept as its own option since it's
		// also a solid general-purpose choice on its own.
		family: 'Noto Sans',
		// verified via fontkit against noto-sans-latin-400-normal.woff — no
		// dlig/hlig/calt/onum/lnum/zero/smcp/c2sc/ssXX support in this font.
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'noto-sans',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — modern, neutral, Google's own UI workhorse; a safe default
		// pick for tech/product CVs.
		family: 'Roboto',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'lnum',
			'numr',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'roboto',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — humanist, extremely legible at small sizes; one of the
		// most commonly recommended resume fonts.
		family: 'Open Sans',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'mark',
			'mkmk',
		],
		fontsourceId: 'open-sans',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — warm, semi-condensed, reads as approachable/professional.
		family: 'Lato',
		features: ['liga', 'kern'],
		fontsourceId: 'lato',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — geometric, strong bold weight; great for name/section
		// headings on a design-forward CV.
		family: 'Montserrat',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'montserrat',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — elegant, slightly condensed; popular for stylish/creative
		// resumes without sacrificing readability.
		family: 'Raleway',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'lnum',
			'numr',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'raleway',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — highly legible, designed for text-heavy documents;
		// a traditional-but-warm choice for academic/legal CVs.
		family: 'Merriweather',
		features: [
			'calt',
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'merriweather',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — contemporary, moderate contrast; frequently recommended
		// as a fresher alternative to Times New Roman.
		family: 'Lora',
		features: [
			'calt',
			'ccmp',
			'frac',
			'liga',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'lora',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — elegant high-contrast display face; best for a name/
		// header line rather than body copy.
		family: 'Playfair Display',
		features: [
			'calt',
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'lnum',
			'numr',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'playfair-display',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — classic Garamond revival; elegant, academic tone.
		family: 'EB Garamond',
		features: [
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'rlig',
			'tnum',
			'kern',
			'mark',
		],
		fontsourceId: 'eb-garamond',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — metric-compatible, OFL-licensed substitute for Georgia
		// (a font that, like Tahoma, can't be legally self-hosted here).
		family: 'Georgia',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'lnum',
			'numr',
			'pnum',
			'tnum',
			'mark',
			'mkmk',
		],
		fontsourceId: 'gelasio',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — metric-compatible, OFL-licensed substitute for Calibri
		// (Microsoft Office's own default, can't be self-hosted here).
		family: 'Calibri',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'kern',
		],
		fontsourceId: 'carlito',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// sans — metric-compatible, OFL-licensed substitute for Arial
		// (proprietary Monotype font, can't be self-hosted here).
		family: 'Arial',
		features: ['ccmp', 'kern', 'mark', 'mkmk'],
		fontsourceId: 'arimo',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// serif — metric-compatible, OFL-licensed substitute for Times New
		// Roman (proprietary Monotype font, can't be self-hosted here).
		family: 'Times New Roman',
		features: ['ccmp', 'kern'],
		fontsourceId: 'tinos',
		subset: 'latin',
		weights: [400, 700],
	},
	{
		// meli.tex specifies Tahoma, a proprietary Microsoft font that can't
		// be legally redistributed/self-hosted from this repo — reuses the
		// already-verified Noto Sans files under this app-facing label since
		// it's the closest freely-licensed (OFL) substitute.
		family: 'Tahoma',
		features: [
			'ccmp',
			'dnom',
			'frac',
			'liga',
			'numr',
			'pnum',
			'tnum',
			'kern',
			'mark',
			'mkmk',
		],
		fontsourceId: 'noto-sans',
		subset: 'latin',
		weights: [400, 700],
	},
];

/** Family used by PDF components that don't request one explicitly. */
export const DEFAULT_PDF_FONT_FAMILY = 'Noto Sans';

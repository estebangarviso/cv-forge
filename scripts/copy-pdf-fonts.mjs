#!/usr/bin/env node
/**
 * Copies the static font files bundled with each @fontsource/* package
 * listed in src/shared/ui/pdf/pdf-fonts.config.mjs into public/fonts/<id>/,
 * so @react-pdf/renderer loads them from our own origin instead of an
 * external CDN at PDF-generation time. Re-run after editing that config.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PDF_FONTS } from '../src/shared/ui/pdf/pdf-fonts.config.mjs';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

let copied = 0;

for (const {
	fontsourceId,
	styles = ['normal'],
	subset,
	weights,
} of PDF_FONTS) {
	const srcDir = join(ROOT, `node_modules/@fontsource/${fontsourceId}/files`);
	const outDir = join(ROOT, `public/fonts/${fontsourceId}`);
	mkdirSync(outDir, { recursive: true });

	for (const weight of weights) {
		for (const style of styles) {
			// .woff (not .woff2) — see fonts.ts for why.
			const fileName = `${fontsourceId}-${subset}-${weight}-${style}.woff`;
			const src = join(srcDir, fileName);
			if (!existsSync(src)) {
				throw new Error(
					`Missing ${fileName} — is @fontsource/${fontsourceId} installed? Run: pnpm add -D @fontsource/${fontsourceId}`,
				);
			}
			copyFileSync(src, join(outDir, fileName));
			copied++;
		}
	}
}

console.info(`✓ Copied ${copied} PDF font file(s) to public/fonts/`);

/**
 * Locale configuration.
 *
 * Replace placeholders via `node scripts/init.mjs`:
 *   - 'es', 'en' → e.g. 'en', 'es'
 *   - es    → e.g. en
 *
 * This file is imported by the Next.js middleware (Edge runtime) — keep it
 * dependency-free (no framework imports, no Node.js built-ins).
 */

export const SUPPORTED_LOCALES = ['es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

/** Type guard — safe for use in middleware (Edge runtime). */
export const isLocale = (value: string): value is Locale =>
	(SUPPORTED_LOCALES as readonly string[]).includes(value);

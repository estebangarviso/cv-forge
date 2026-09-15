import { z } from 'zod';

/** Persisted as JSON in the Drive file's own `description` field — the file's binary content is never re-parsed just to read this. */
export const CustomFontMetaSchema = z.object({
	family: z.string().min(1),
	features: z.array(z.string()).default([]),
	originalFileName: z.string(),
});
export type CustomFontMeta = z.infer<typeof CustomFontMetaSchema>;

export const CustomFontSchema = CustomFontMetaSchema.extend({
	id: z.string(),
	/** Drive's own stored MIME type — not duplicated in `description`, read fresh from the file each time. */
	mimeType: z.string(),
});
export type CustomFont = z.infer<typeof CustomFontSchema>;

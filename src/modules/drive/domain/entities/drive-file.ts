import { z } from 'zod';

export const DriveFileSchema = z.object({
	/** Free-form metadata (e.g. custom font family/features JSON) — never used for CV JSON files. */
	description: z.string().optional(),
	id: z.string(),
	mimeType: z.string(),
	modifiedTime: z.string().datetime(),
	name: z.string(),
	size: z.string().optional(),
});

export type DriveFile = z.infer<typeof DriveFileSchema>;

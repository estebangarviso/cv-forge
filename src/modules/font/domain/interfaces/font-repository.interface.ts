import type { CustomFont } from '../entities/custom-font';

export interface FontRepository {
	/** Permanently removes this font from Drive — the caller is responsible for un-assigning it from any CV's regular/bold slot first. */
	delete(id: string): Promise<void>;
	/** Looks for a font already uploaded under this exact original file name (Drive-wide within the fonts folder) — used to prompt an overwrite instead of silently creating a duplicate. */
	findExisting(originalFileName: string): Promise<CustomFont | null>;
	/** Base64-encoded font bytes, for `Font.register({ src: data-uri })` at render time. */
	getContent(id: string): Promise<string>;
	getMetadata(id: string): Promise<CustomFont | null>;
	/** Page of fonts uploaded to the shared Drive fonts folder, regardless of whether they're currently assigned to any CV's regular/bold slot — powers the typography dialog's lazy-loaded fonts table. */
	listPage(options: {
		pageSize: number;
		pageToken?: string;
	}): Promise<{ fonts: CustomFont[]; nextPageToken?: string }>;
	upload(
		base64Content: string,
		meta: {
			family: string;
			features: string[];
			mimeType: string;
			originalFileName: string;
			/** Overwrites this existing file's content/metadata in place instead of creating a new one. */
			overwriteId?: string;
		},
	): Promise<CustomFont>;
}

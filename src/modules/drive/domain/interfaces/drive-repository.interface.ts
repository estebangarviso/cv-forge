import type { DriveFile } from '../entities/drive-file';

export interface DriveRepository {
	createFile(
		folderId: string,
		name: string,
		content: string,
		mimeType?: string,
		description?: string,
	): Promise<DriveFile>;
	deleteFile(fileId: string): Promise<void>;
	/** Returns the first file with `name` inside `folderId`, excluding `excludeId`. */
	findFileByName(
		folderId: string,
		name: string,
		excludeId?: string,
	): Promise<DriveFile | null>;
	getFile(fileId: string): Promise<string>;
	/** Metadata only (no content download) — use for cheap lookups like a custom font's stored description. */
	getFileMetadata(fileId: string): Promise<DriveFile>;
	/** Scoped to `parentId` when given (never matches a same-named folder elsewhere); unscoped (searched Drive-wide) when omitted, for the top-level app folder. */
	getOrCreateFolder(name: string, parentId?: string): Promise<string>;
	listFiles(folderId: string): Promise<DriveFile[]>;
	/** Like `listFiles` but for arbitrary MIME types (e.g. font files) instead of the hardcoded CV JSON type. */
	listFilesByMimeTypes(
		folderId: string,
		mimeTypes: string[],
	): Promise<DriveFile[]>;
	/** Paginated variant of `listFilesByMimeTypes` for large lists (e.g. the fonts table's lazy-loaded scroll) — stable order via file name so pages don't shift while the user scrolls. */
	listFilesByMimeTypesPage(
		folderId: string,
		mimeTypes: string[],
		options: { pageSize: number; pageToken?: string },
	): Promise<{ files: DriveFile[]; nextPageToken?: string }>;
	/** Re-parents a file (Drive's move primitive) — used to migrate files created before a folder reorganization. */
	moveFile(
		fileId: string,
		newParentId: string,
		oldParentId: string,
	): Promise<void>;
	/** Update file content and optionally rename/re-describe it in one request. `mimeType` defaults to the CV JSON type; pass a font MIME type when overwriting a font file. */
	updateFile(
		fileId: string,
		content: string,
		name?: string,
		description?: string,
		mimeType?: string,
	): Promise<DriveFile>;
}

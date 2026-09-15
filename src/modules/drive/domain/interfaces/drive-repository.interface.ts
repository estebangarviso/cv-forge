import type { DriveFile } from '../entities/drive-file';

export interface DriveRepository {
	createFile(
		folderId: string,
		name: string,
		content: string,
		mimeType?: string,
	): Promise<DriveFile>;
	deleteFile(fileId: string): Promise<void>;
	getFile(fileId: string): Promise<string>;
	getOrCreateFolder(name: string): Promise<string>;
	listFiles(folderId: string): Promise<DriveFile[]>;
	updateFile(fileId: string, content: string): Promise<DriveFile>;
}

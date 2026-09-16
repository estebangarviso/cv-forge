import { google } from 'googleapis';

import type { DriveFile } from '../domain/entities/drive-file';
import type { DriveRepository } from '../domain/interfaces/drive-repository.interface';

import { DriveFileSchema } from '../domain/entities/drive-file';

const JSON_MIME = 'application/json';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

export class GoogleDriveRepository implements DriveRepository {
	private readonly drive;

	constructor(accessToken: string) {
		const auth = new google.auth.OAuth2();
		auth.setCredentials({ access_token: accessToken });
		this.drive = google.drive({ auth, version: 'v3' });
	}

	async listFiles(folderId: string): Promise<DriveFile[]> {
		const res = await this.drive.files.list({
			fields: 'files(id, name, mimeType, modifiedTime, size)',
			orderBy: 'modifiedTime desc',
			q: `'${folderId}' in parents and mimeType='${JSON_MIME}' and trashed=false`,
		});

		return (res.data.files ?? []).map((f) =>
			DriveFileSchema.parse({
				id: f.id,
				mimeType: f.mimeType,
				modifiedTime: f.modifiedTime,
				name: f.name,
				size: f.size ?? undefined,
			}),
		);
	}

	async getFile(fileId: string): Promise<string> {
		const res = await this.drive.files.get(
			{ alt: 'media', fileId },
			{ responseType: 'text' },
		);
		return res.data as string;
	}

	async getFileMetadata(fileId: string): Promise<DriveFile> {
		const res = await this.drive.files.get({
			fields: 'id, name, mimeType, modifiedTime, size, description',
			fileId,
		});

		return DriveFileSchema.parse({
			description: res.data.description ?? undefined,
			id: res.data.id,
			mimeType: res.data.mimeType,
			modifiedTime: res.data.modifiedTime,
			name: res.data.name,
			size: res.data.size ?? undefined,
		});
	}

	async createFile(
		folderId: string,
		name: string,
		content: string,
		mimeType = JSON_MIME,
		description?: string,
	): Promise<DriveFile> {
		const res = await this.drive.files.create({
			fields: 'id, name, mimeType, modifiedTime, size, description',
			media: { body: content, mimeType },
			requestBody: { description, mimeType, name, parents: [folderId] },
		});

		return DriveFileSchema.parse({
			description: res.data.description ?? undefined,
			id: res.data.id,
			mimeType: res.data.mimeType,
			modifiedTime: res.data.modifiedTime,
			name: res.data.name,
			size: res.data.size ?? undefined,
		});
	}

	async updateFile(
		fileId: string,
		content: string,
		name?: string,
		description?: string,
		mimeType: string = JSON_MIME,
	): Promise<DriveFile> {
		const res = await this.drive.files.update({
			fields: 'id, name, mimeType, modifiedTime, size, description',
			fileId,
			media: { body: content, mimeType },
			requestBody: { description, name },
		});

		return DriveFileSchema.parse({
			description: res.data.description ?? undefined,
			id: res.data.id,
			mimeType: res.data.mimeType,
			modifiedTime: res.data.modifiedTime,
			name: res.data.name,
			size: res.data.size ?? undefined,
		});
	}

	async findFileByName(
		folderId: string,
		name: string,
		excludeId?: string,
	): Promise<DriveFile | null> {
		// escape backslashes then single quotes for the Drive query language
		const safeName = name
			.replaceAll('\\', '\\\\')
			.replaceAll("'", String.raw`\'`);
		const res = await this.drive.files.list({
			fields: 'files(id, name, mimeType, modifiedTime, size)',
			q: `'${folderId}' in parents and name='${safeName}' and mimeType='${JSON_MIME}' and trashed=false`,
		});

		const file = (res.data.files ?? []).find((f) => f.id !== excludeId);
		if (!file) return null;

		return DriveFileSchema.parse({
			id: file.id,
			mimeType: file.mimeType,
			modifiedTime: file.modifiedTime,
			name: file.name,
			size: file.size ?? undefined,
		});
	}

	async deleteFile(fileId: string): Promise<void> {
		await this.drive.files.update({
			fileId,
			requestBody: { trashed: true },
		});
	}

	async getOrCreateFolder(name: string, parentId?: string): Promise<string> {
		const safeName = name
			.replaceAll('\\', '\\\\')
			.replaceAll("'", String.raw`\'`);
		const parentClause = parentId ? `'${parentId}' in parents and ` : '';
		const res = await this.drive.files.list({
			fields: 'files(id)',
			q: `${parentClause}mimeType='${FOLDER_MIME}' and name='${safeName}' and trashed=false`,
		});

		const existing = res.data.files?.[0];
		if (existing?.id) return existing.id;

		const created = await this.drive.files.create({
			fields: 'id',
			requestBody: {
				mimeType: FOLDER_MIME,
				name,
				parents: parentId ? [parentId] : undefined,
			},
		});

		if (!created.data.id) throw new Error('Failed to create Drive folder');
		return created.data.id;
	}

	async listFilesByMimeTypes(
		folderId: string,
		mimeTypes: string[],
	): Promise<DriveFile[]> {
		const mimeClause = mimeTypes.map((m) => `mimeType='${m}'`).join(' or ');
		const res = await this.drive.files.list({
			fields: 'files(id, name, mimeType, modifiedTime, size)',
			q: `'${folderId}' in parents and (${mimeClause}) and trashed=false`,
		});

		return (res.data.files ?? []).map((f) =>
			DriveFileSchema.parse({
				id: f.id,
				mimeType: f.mimeType,
				modifiedTime: f.modifiedTime,
				name: f.name,
				size: f.size ?? undefined,
			}),
		);
	}

	async listFilesByMimeTypesPage(
		folderId: string,
		mimeTypes: string[],
		options: { pageSize: number; pageToken?: string },
	): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
		const mimeClause = mimeTypes.map((m) => `mimeType='${m}'`).join(' or ');
		const res = await this.drive.files.list({
			fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size)',
			orderBy: 'name',
			pageSize: options.pageSize,
			pageToken: options.pageToken,
			q: `'${folderId}' in parents and (${mimeClause}) and trashed=false`,
		});

		return {
			files: (res.data.files ?? []).map((f) =>
				DriveFileSchema.parse({
					id: f.id,
					mimeType: f.mimeType,
					modifiedTime: f.modifiedTime,
					name: f.name,
					size: f.size ?? undefined,
				}),
			),
			nextPageToken: res.data.nextPageToken ?? undefined,
		};
	}

	async moveFile(
		fileId: string,
		newParentId: string,
		oldParentId: string,
	): Promise<void> {
		await this.drive.files.update({
			addParents: newParentId,
			fields: 'id, parents',
			fileId,
			removeParents: oldParentId,
		});
	}
}

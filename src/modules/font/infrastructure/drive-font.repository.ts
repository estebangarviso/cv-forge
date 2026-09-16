import type { DriveRepository } from '@modules/drive';

import type { CustomFont } from '../domain/entities/custom-font';
import type { FontRepository } from '../domain/interfaces/font-repository.interface';

import { CustomFontMetaSchema } from '../domain/entities/custom-font';

// same Drive root as CVs, but under its own assets/fonts/ subfolder —
// `listFiles`/`findFileByName` (CVs) filter strictly by
// `mimeType='application/json'`, so font files never pollute the CV list
// regardless of folder, but nesting keeps My Drive tidy to browse.
const FOLDER_NAME = 'CV Studio';
const ASSETS_FOLDER_NAME = 'assets';
const FONTS_FOLDER_NAME = 'fonts';
const FONT_MIME_TYPES = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2'];

export class DriveFontRepository implements FontRepository {
	constructor(private readonly driveRepo: DriveRepository) {}

	/**
	 * Resolves `CV Studio/assets/fonts/`, moving any font files still sitting
	 * directly in the root `CV Studio` folder (from before this subfolder
	 * existed) into it. Only called from `upload()` — the sole method that
	 * needs folder resolution at all; `getMetadata`/`getContent` fetch by
	 * Drive id directly and don't care which folder a file lives in.
	 */
	private async resolveFontsFolder(): Promise<string> {
		const rootId = await this.driveRepo.getOrCreateFolder(FOLDER_NAME);
		const assetsId = await this.driveRepo.getOrCreateFolder(
			ASSETS_FOLDER_NAME,
			rootId,
		);
		const fontsId = await this.driveRepo.getOrCreateFolder(
			FONTS_FOLDER_NAME,
			assetsId,
		);
		const loose = await this.driveRepo.listFilesByMimeTypes(
			rootId,
			FONT_MIME_TYPES,
		);
		await Promise.all(
			loose.map((f) => this.driveRepo.moveFile(f.id, fontsId, rootId)),
		);
		return fontsId;
	}

	getContent(id: string): Promise<string> {
		return this.driveRepo.getFile(id);
	}

	async findExisting(originalFileName: string): Promise<CustomFont | null> {
		const fontsId = await this.resolveFontsFolder();
		const files = await this.driveRepo.listFilesByMimeTypes(
			fontsId,
			FONT_MIME_TYPES,
		);
		const match = files.find((f) => f.name === originalFileName);
		return match ? this.getMetadata(match.id) : null;
	}

	async listPage(options: {
		pageSize: number;
		pageToken?: string;
	}): Promise<{ fonts: CustomFont[]; nextPageToken?: string }> {
		const fontsId = await this.resolveFontsFolder();
		const { files, nextPageToken } =
			await this.driveRepo.listFilesByMimeTypesPage(
				fontsId,
				FONT_MIME_TYPES,
				options,
			);
		const fonts = await Promise.all(
			files.map((f) => this.getMetadata(f.id)),
		);
		return {
			fonts: fonts.filter((f): f is CustomFont => f !== null),
			nextPageToken,
		};
	}

	delete(id: string): Promise<void> {
		return this.driveRepo.deleteFile(id);
	}

	async getMetadata(id: string): Promise<CustomFont | null> {
		try {
			const file = await this.driveRepo.getFileMetadata(id);
			if (!file.description) return null;
			const meta = CustomFontMetaSchema.parse(
				JSON.parse(file.description) as Record<string, unknown>,
			);
			return { ...meta, id: file.id, mimeType: file.mimeType };
		} catch (error) {
			console.error(
				`DriveFontRepository.getMetadata(${id}) failed:`,
				error,
			);
			return null;
		}
	}

	async upload(
		base64Content: string,
		meta: {
			family: string;
			features: string[];
			mimeType: string;
			originalFileName: string;
			overwriteId?: string;
		},
	): Promise<CustomFont> {
		const description = JSON.stringify({
			family: meta.family,
			features: meta.features,
			originalFileName: meta.originalFileName,
		});

		const file = meta.overwriteId
			? await this.driveRepo.updateFile(
					meta.overwriteId,
					base64Content,
					meta.originalFileName,
					description,
					meta.mimeType,
				)
			: await this.driveRepo.createFile(
					await this.resolveFontsFolder(),
					meta.originalFileName,
					base64Content,
					meta.mimeType,
					description,
				);

		return {
			family: meta.family,
			features: meta.features,
			id: file.id,
			mimeType: file.mimeType,
			originalFileName: meta.originalFileName,
		};
	}
}

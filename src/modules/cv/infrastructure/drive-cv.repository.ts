/* eslint-disable max-classes-per-file -- CvNameConflictError is a small auxiliary error class for this repository */
import type { DriveRepository } from '@modules/drive';

import type { CvData } from '../domain/entities/cv-data';
import type { CvRepository } from '../domain/interfaces/cv-repository.interface';

import { CvDataSchema } from '../domain/entities/cv-data';

const FOLDER_NAME = 'CV Studio';
const DOCUMENTS_FOLDER_NAME = 'documents';
const MAX_COPY_NAME_ATTEMPTS = 100;

export class CvNameConflictError extends Error {
	constructor(name: string) {
		super('NAME_CONFLICT');
		this.name = 'CvNameConflictError';
		// keep the human-readable detail for server logs
		this.stack = `CvNameConflictError: CV named "${name}" already exists`;
	}
}

export class DriveCvRepository implements CvRepository {
	constructor(private readonly driveRepo: DriveRepository) {}

	/**
	 * Resolves `CV Studio/documents/`. `migrate` also moves any CV JSON files
	 * still sitting directly in the root `CV Studio` folder (from before this
	 * subfolder existed) into `documents/` — self-healing, and cheap once
	 * there's nothing left to move, so only worth doing from the low-frequency
	 * `list()` call, not from `save()` (which runs on every autosave).
	 */
	private async resolveDocumentsFolder(migrate: boolean): Promise<string> {
		const rootId = await this.driveRepo.getOrCreateFolder(FOLDER_NAME);
		const documentsId = await this.driveRepo.getOrCreateFolder(
			DOCUMENTS_FOLDER_NAME,
			rootId,
		);
		if (migrate) {
			const loose = await this.driveRepo.listFiles(rootId);
			await Promise.all(
				loose.map((f) =>
					this.driveRepo.moveFile(f.id, documentsId, rootId),
				),
			);
		}
		return documentsId;
	}

	async list(): Promise<Pick<CvData, 'cvTitle' | 'id' | 'updatedAt'>[]> {
		const folderId = await this.resolveDocumentsFolder(true);
		const files = await this.driveRepo.listFiles(folderId);

		return files.map((f) => ({
			cvTitle: f.name.replace(/\.json$/u, ''),
			id: f.id,
			updatedAt: f.modifiedTime,
		}));
	}

	async getById(id: string): Promise<CvData | null> {
		try {
			const content = await this.driveRepo.getFile(id);
			const parsed = JSON.parse(content) as Record<string, unknown>;
			return CvDataSchema.parse({ ...parsed, id });
		} catch (error) {
			console.error(`DriveCvRepository.getById(${id}) failed:`, error);
			return null;
		}
	}

	async save(cv: CvData): Promise<CvData> {
		const now = new Date().toISOString();
		const data = { ...cv, updatedAt: now };
		const folderId = await this.resolveDocumentsFolder(false);
		const fileName = `${cv.cvTitle || cv.name || 'Untitled CV'}.json`;

		// prevent duplicate filenames (exclude self when updating)
		const conflict = await this.driveRepo.findFileByName(
			folderId,
			fileName,
			cv.id,
		);
		if (conflict) {
			throw new CvNameConflictError(cv.name || 'Untitled CV');
		}

		if (cv.id) {
			// update content and rename the Drive file atomically
			await this.driveRepo.updateFile(
				cv.id,
				JSON.stringify(data),
				fileName,
			);
			return data;
		}

		const created = await this.driveRepo.createFile(
			folderId,
			fileName,
			JSON.stringify({ ...data, createdAt: now }),
		);

		return { ...data, createdAt: now, id: created.id };
	}

	async delete(id: string): Promise<void> {
		await this.driveRepo.deleteFile(id);
	}

	async duplicate(sourceId: string, copyTitle: string): Promise<CvData> {
		const now = new Date().toISOString();
		const folderId = await this.resolveDocumentsFolder(false);

		// load source CV
		const sourceContent = await this.driveRepo.getFile(sourceId);
		const sourceParsed = JSON.parse(sourceContent) as Record<
			string,
			unknown
		>;
		const source = CvDataSchema.parse(sourceParsed);

		let resolvedTitle = copyTitle;
		for (let attempt = 1; attempt <= MAX_COPY_NAME_ATTEMPTS; attempt++) {
			const fileName = `${resolvedTitle}.json`;
			const conflict = await this.driveRepo.findFileByName(
				folderId,
				fileName,
			);
			if (!conflict) break;
			if (attempt === MAX_COPY_NAME_ATTEMPTS) {
				throw new CvNameConflictError(copyTitle);
			}
			resolvedTitle = `${copyTitle} ${attempt + 1}`;
		}

		const newPayload = CvDataSchema.parse({
			...source,
			createdAt: now,
			cvTitle: resolvedTitle,
			id: undefined,
			updatedAt: now,
		});

		// create new Drive file
		const fileName = `${resolvedTitle}.json`;
		const created = await this.driveRepo.createFile(
			folderId,
			fileName,
			JSON.stringify(newPayload),
		);

		return { ...newPayload, id: created.id };
	}
}

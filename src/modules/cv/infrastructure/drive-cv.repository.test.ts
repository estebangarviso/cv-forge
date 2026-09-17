import type { DriveRepository } from '@modules/drive';

import { describe, expect, it, vi } from 'vitest';

import type { CvData } from '../domain/entities/cv-data';

import { EMPTY_CV } from '../domain/entities/cv-data';
import { DEFAULT_TEMPLATE } from '../domain/entities/template-config';
import { DriveCvRepository } from './drive-cv.repository';

describe('DriveCvRepository.duplicate', () => {
	const now = new Date().toISOString();
	const duplicatedTitle = 'My CV - Copy';
	const sourceCV: CvData = {
		...EMPTY_CV,
		aboutMe: 'About me text',
		address: 'Street 123',
		createdAt: '2023-01-01T00:00:00Z',
		cvTitle: 'My CV',
		education: [
			{
				subtitle: 'University',
				title: 'BS Computer Science',
			},
		],
		email: 'test@example.com',
		experience: [
			{
				bullets: ['Worked on X', 'Achieved Y'],
				details: 'Company Inc',
				role: 'Engineer',
			},
		],
		id: 'source-id',
		name: 'John Doe',
		phone: '555-0000',
		skills: [
			{
				label: 'TypeScript',
				level: 90,
			},
		],
		theme: DEFAULT_TEMPLATE,
		title: 'Software Engineer',
		updatedAt: now,
	};

	const createFakeDriveRepo = (
		overrides: Partial<Record<string, unknown>> = {},
	) => ({
		createFile: vi.fn(
			(_folderId: string, fileName: string, content: string) =>
				Promise.resolve({
					content,
					id: 'new-id',
					mimeType: 'application/json',
					modifiedTime: new Date().toISOString(),
					name: fileName,
				}),
		),
		deleteFile: vi.fn().mockResolvedValue(undefined),
		findFileByName: vi.fn().mockResolvedValue(null),
		getFile: vi.fn().mockResolvedValue(JSON.stringify(sourceCV)),
		getFileMetadata: vi.fn((fileId: string) =>
			Promise.resolve({
				id: fileId,
				mimeType: 'application/json',
				modifiedTime: new Date().toISOString(),
				name: 'mock-file.json',
			}),
		),
		getOrCreateFolder: vi.fn().mockResolvedValue('folder-id'),
		listFiles: vi.fn().mockResolvedValue([]),
		listFilesByMimeTypes: vi.fn().mockResolvedValue([]),
		listFilesByMimeTypesPage: vi.fn().mockResolvedValue({ files: [] }),
		moveFile: vi.fn().mockResolvedValue(undefined),
		updateFile: vi.fn((_fileId: string, _content: string, name?: string) =>
			Promise.resolve({
				id: 'updated-id',
				mimeType: 'application/json',
				modifiedTime: new Date().toISOString(),
				name: name ?? 'updated.json',
			}),
		),
		...overrides,
	});

	describe('data preservation', () => {
		it('should preserve all compatible CvData fields from source', async () => {
			const fakeDriveRepo = createFakeDriveRepo();

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			const duplicate = await repo.duplicate(
				'source-id',
				duplicatedTitle,
			);

			// verify content fields are preserved
			expect(duplicate.name).toBe(sourceCV.name);
			expect(duplicate.email).toBe(sourceCV.email);
			expect(duplicate.phone).toBe(sourceCV.phone);
			expect(duplicate.address).toBe(sourceCV.address);
			expect(duplicate.title).toBe(sourceCV.title);
			expect(duplicate.aboutMe).toBe(sourceCV.aboutMe);
			expect(duplicate.experience).toStrictEqual(sourceCV.experience);
			expect(duplicate.education).toStrictEqual(sourceCV.education);
			expect(duplicate.skills).toStrictEqual(sourceCV.skills);
			expect(duplicate.theme).toStrictEqual(sourceCV.theme);
		});

		it('should create duplicate with new ID', async () => {
			const fakeDriveRepo = createFakeDriveRepo();

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			const duplicate = await repo.duplicate(
				'source-id',
				duplicatedTitle,
			);

			expect(duplicate.id).toBe('new-id');
			expect(duplicate.id).not.toBe(sourceCV.id);
		});

		it('should generate new timestamps for duplicate', async () => {
			const beforeTime = new Date().toISOString();

			const fakeDriveRepo = createFakeDriveRepo();

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			const duplicate = await repo.duplicate(
				'source-id',
				duplicatedTitle,
			);

			const afterTime = new Date().toISOString();

			expect(
				Date.parse(duplicate.createdAt ?? ''),
			).toBeGreaterThanOrEqual(Date.parse(beforeTime));
			expect(Date.parse(duplicate.createdAt ?? '')).toBeLessThanOrEqual(
				Date.parse(afterTime),
			);
			expect(
				Date.parse(duplicate.updatedAt ?? ''),
			).toBeGreaterThanOrEqual(Date.parse(beforeTime));
			expect(Date.parse(duplicate.updatedAt ?? '')).toBeLessThanOrEqual(
				Date.parse(afterTime),
			);
		});

		it('should use provided copyTitle as cvTitle', async () => {
			const fakeDriveRepo = createFakeDriveRepo();

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			const duplicate = await repo.duplicate(
				'source-id',
				duplicatedTitle,
			);

			expect(duplicate.cvTitle).toBe(duplicatedTitle);
		});
	});

	describe('error handling', () => {
		it('should throw error if source cannot be loaded', async () => {
			const fakeDriveRepo = createFakeDriveRepo({
				getFile: vi
					.fn()
					.mockRejectedValue(new Error('Source not found')),
			});

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);

			await expect(
				repo.duplicate('nonexistent-id', duplicatedTitle),
			).rejects.toThrow();
		});

		it('should never delete source on error', async () => {
			const deleteFileSpy = vi.fn();

			const fakeDriveRepo = {
				createFile: vi
					.fn()
					.mockRejectedValue(new Error('Create failed')),
				deleteFile: deleteFileSpy,
				findFileByName: vi.fn().mockResolvedValue(null),
				getFile: vi.fn().mockResolvedValue(JSON.stringify(sourceCV)),
				getFileMetadata: vi.fn((fileId: string) =>
					Promise.resolve({
						id: fileId,
						mimeType: 'application/json',
						modifiedTime: new Date().toISOString(),
						name: 'mock-file.json',
					}),
				),
				getOrCreateFolder: vi.fn().mockResolvedValue('folder-id'),
				listFiles: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypes: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypesPage: vi
					.fn()
					.mockResolvedValue({ files: [] }),
				moveFile: vi.fn().mockResolvedValue(undefined),
				updateFile: vi.fn(
					(_fileId: string, _content: string, name?: string) =>
						Promise.resolve({
							id: 'updated-id',
							mimeType: 'application/json',
							modifiedTime: new Date().toISOString(),
							name: name ?? 'updated.json',
						}),
				),
			};

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);

			await expect(
				repo.duplicate('source-id', duplicatedTitle),
			).rejects.toThrow();

			expect(deleteFileSpy).not.toHaveBeenCalled();
		});

		it('should validate source CvData schema', async () => {
			const fakeDriveRepo = {
				createFile: vi.fn(),
				deleteFile: vi.fn().mockResolvedValue(undefined),
				findFileByName: vi.fn().mockResolvedValue(null),
				getFile: vi
					.fn()
					.mockResolvedValue(JSON.stringify({ malformed: 'data' })),
				getFileMetadata: vi.fn((fileId: string) =>
					Promise.resolve({
						id: fileId,
						mimeType: 'application/json',
						modifiedTime: new Date().toISOString(),
						name: 'mock-file.json',
					}),
				),
				getOrCreateFolder: vi.fn().mockResolvedValue('folder-id'),
				listFiles: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypes: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypesPage: vi
					.fn()
					.mockResolvedValue({ files: [] }),
				moveFile: vi.fn().mockResolvedValue(undefined),
				updateFile: vi.fn(
					(_fileId: string, _content: string, name?: string) =>
						Promise.resolve({
							id: 'updated-id',
							mimeType: 'application/json',
							modifiedTime: new Date().toISOString(),
							name: name ?? 'updated.json',
						}),
				),
			};

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);

			await expect(
				repo.duplicate('source-id', duplicatedTitle),
			).rejects.toThrow();
		});
	});

	describe('naming and conflict resolution', () => {
		it('should use provided copyTitle as Drive filename', async () => {
			const createFileSpy = vi.fn((folderId, fileName, _content) =>
				Promise.resolve({
					id: 'new-id',
					mimeType: 'application/json',
					modifiedTime: new Date().toISOString(),
					name: fileName,
				}),
			);

			const fakeDriveRepo = createFakeDriveRepo({
				createFile: createFileSpy,
				findFileByName: vi.fn().mockResolvedValue(null),
			});

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			await repo.duplicate('source-id', duplicatedTitle);

			expect(createFileSpy).toHaveBeenCalledWith(
				expect.anything(),
				'My CV - Copy.json',
				expect.anything(),
			);
		});

		it('should choose the next available copy title', async () => {
			const createFileSpy = vi.fn((folderId, fileName, _content) =>
				Promise.resolve({
					id: 'new-id',
					mimeType: 'application/json',
					modifiedTime: new Date().toISOString(),
					name: fileName,
				}),
			);
			const findFileByNameSpy = vi
				.fn()
				.mockResolvedValueOnce({ id: 'existing-id' })
				.mockResolvedValueOnce({ id: 'existing-id-2' })
				.mockResolvedValueOnce(null);
			const fakeDriveRepo = {
				createFile: createFileSpy,
				deleteFile: vi.fn(),
				findFileByName: findFileByNameSpy,
				getFile: vi.fn().mockResolvedValue(JSON.stringify(sourceCV)),
				getFileMetadata: vi.fn((fileId: string) =>
					Promise.resolve({
						id: fileId,
						mimeType: 'application/json',
						modifiedTime: new Date().toISOString(),
						name: 'mock-file.json',
					}),
				),
				getOrCreateFolder: vi.fn().mockResolvedValue('folder-id'),
				listFiles: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypes: vi.fn().mockResolvedValue([]),
				listFilesByMimeTypesPage: vi
					.fn()
					.mockResolvedValue({ files: [] }),
				moveFile: vi.fn(),
				updateFile: vi.fn(),
			};

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);
			const duplicate = await repo.duplicate(
				'source-id',
				duplicatedTitle,
			);

			expect(duplicate.cvTitle).toBe('My CV - Copy 3');
			expect(createFileSpy).toHaveBeenCalledWith(
				'folder-id',
				'My CV - Copy 3.json',
				expect.any(String),
			);
		});

		it('fails after exhausting copy title attempts', async () => {
			const fakeDriveRepo = createFakeDriveRepo({
				findFileByName: vi
					.fn()
					.mockResolvedValue({ id: 'existing-id' }),
			});

			const repo = new DriveCvRepository(
				fakeDriveRepo as DriveRepository,
			);

			await expect(
				repo.duplicate('source-id', duplicatedTitle),
			).rejects.toThrow('NAME_CONFLICT');
		});
	});
});

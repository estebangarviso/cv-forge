import { describe, expect, it } from 'vitest';

import type { CvData } from '../entities/cv-data';
import type { CvRepository } from '../interfaces/cv-repository.interface';

import { DuplicateCvUseCase } from './duplicate-cv.use-case';

describe('DuplicateCvUseCase', () => {
	const fakeCvData: CvData = {
		aboutMe: 'About me',
		address: 'Address',
		courses: [],
		createdAt: '2023-01-01T00:00:00Z',
		cvTitle: 'My CV',
		education: [],
		email: 'test@example.com',
		experience: [],
		extracurricular: [],
		id: 'source-id',
		languages: [],
		name: 'John Doe',
		other: [],
		phone: '123456789',
		references: [],
		skills: [],
		theme: { colorScheme: 'light', layout: 'modern' } as any,
		title: 'Software Engineer',
		updatedAt: '2024-01-01T00:00:00Z',
	};

	it('should forward sourceId and copyTitle to repository and return the result', async () => {
		const fakeRepo: CvRepository = {
			delete: async () => {},
			duplicate: (sourceId, copyTitle) => {
				expect(sourceId).toBe('source-id');
				expect(copyTitle).toBe('My CV - Copy');
				return Promise.resolve({ ...fakeCvData, id: 'new-id' });
			},
			getById: () => Promise.resolve(null),
			list: () => Promise.resolve([]),
			save: () => Promise.resolve(fakeCvData),
		};

		const useCase = new DuplicateCvUseCase(fakeRepo);
		const result = await useCase.execute('source-id', 'My CV - Copy');

		expect(result.id).toBe('new-id');
	});
});

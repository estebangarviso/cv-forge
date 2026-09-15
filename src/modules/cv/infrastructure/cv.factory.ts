import { getDriveRepository } from '@modules/drive/infrastructure/drive.factory';

import type { CvRepository } from '../domain/interfaces/cv-repository.interface';

import { DuplicateCvUseCase } from '../domain/use-cases/duplicate-cv.use-case';
import { LoadCvUseCase } from '../domain/use-cases/load-cv.use-case';
import { SaveCvUseCase } from '../domain/use-cases/save-cv.use-case';
import { DriveCvRepository } from './drive-cv.repository';

let cvRepository: CvRepository | undefined;
let saveCvUseCase: SaveCvUseCase | undefined;
let loadCvUseCase: LoadCvUseCase | undefined;
let duplicateCvUseCase: DuplicateCvUseCase | undefined;

export function setCvRepository(repo: CvRepository): void {
	cvRepository = repo;
	saveCvUseCase = undefined;
	loadCvUseCase = undefined;
	duplicateCvUseCase = undefined;
}

export function getCvRepository(accessToken: string): CvRepository {
	const driveRepo = getDriveRepository(accessToken);
	return new DriveCvRepository(driveRepo);
}

export function getSaveCvUseCase(): SaveCvUseCase {
	if (!cvRepository)
		throw new Error(
			'CvRepository not initialized. Call setCvRepository first.',
		);
	if (!saveCvUseCase) saveCvUseCase = new SaveCvUseCase(cvRepository);
	return saveCvUseCase;
}

export function getLoadCvUseCase(): LoadCvUseCase {
	if (!cvRepository)
		throw new Error(
			'CvRepository not initialized. Call setCvRepository first.',
		);
	if (!loadCvUseCase) loadCvUseCase = new LoadCvUseCase(cvRepository);
	return loadCvUseCase;
}

export function getDuplicateCvUseCase(): DuplicateCvUseCase {
	if (!cvRepository)
		throw new Error(
			'CvRepository not initialized. Call setCvRepository first.',
		);
	if (!duplicateCvUseCase)
		duplicateCvUseCase = new DuplicateCvUseCase(cvRepository);
	return duplicateCvUseCase;
}

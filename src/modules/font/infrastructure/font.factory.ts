import { getDriveRepository } from '@modules/drive/infrastructure/drive.factory';

import type { FontRepository } from '../domain/interfaces/font-repository.interface';

import { DriveFontRepository } from './drive-font.repository';

export function getFontRepository(accessToken: string): FontRepository {
	const driveRepo = getDriveRepository(accessToken);
	return new DriveFontRepository(driveRepo);
}

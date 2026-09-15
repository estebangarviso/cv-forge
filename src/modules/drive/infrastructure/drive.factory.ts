import type { DriveRepository } from '../domain/interfaces/drive-repository.interface';

import { GoogleDriveRepository } from './google-drive.repository';

export function getDriveRepository(accessToken: string): DriveRepository {
	return new GoogleDriveRepository(accessToken);
}

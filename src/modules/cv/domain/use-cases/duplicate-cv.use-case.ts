import type { CvData } from '../entities/cv-data';
import type { CvRepository } from '../interfaces/cv-repository.interface';

export class DuplicateCvUseCase {
	constructor(private readonly cvRepository: CvRepository) {}

	execute(sourceId: string, copyTitle: string): Promise<CvData> {
		return this.cvRepository.duplicate(sourceId, copyTitle);
	}
}

import type { CvData } from '../entities/cv-data';
import type { CvRepository } from '../interfaces/cv-repository.interface';

export class SaveCvUseCase {
	constructor(private readonly cvRepository: CvRepository) {}

	execute(cv: CvData): Promise<CvData> {
		return this.cvRepository.save(cv);
	}
}

import type { CvData } from '../entities/cv-data';
import type { CvRepository } from '../interfaces/cv-repository.interface';

export class LoadCvUseCase {
	constructor(private readonly cvRepository: CvRepository) {}

	execute(id: string): Promise<CvData | null> {
		return this.cvRepository.getById(id);
	}
}

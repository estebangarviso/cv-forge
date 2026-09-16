import type { CvData } from '../entities/cv-data';

export interface CvRepository {
	delete(id: string): Promise<void>;
	getById(id: string): Promise<CvData | null>;
	list(): Promise<Pick<CvData, 'id' | 'name' | 'updatedAt'>[]>;
	save(cv: CvData): Promise<CvData>;
}

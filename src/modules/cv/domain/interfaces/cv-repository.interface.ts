import type { CvData } from '../entities/cv-data';

export interface CvRepository {
	delete(id: string): Promise<void>;
	duplicate(sourceId: string, copyTitle: string): Promise<CvData>;
	getById(id: string): Promise<CvData | null>;
	list(): Promise<Pick<CvData, 'cvTitle' | 'id' | 'updatedAt'>[]>;
	save(cv: CvData): Promise<CvData>;
}

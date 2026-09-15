import { describe, expect, it } from 'vitest';

import sampleCv from '../seeds/sample-cv.json';
import { CvDataSchema } from './cv-data';

describe('sample CV fixture', () => {
	it('matches the CvData schema', () => {
		expect(() => CvDataSchema.parse(sampleCv)).not.toThrow();
	});
});

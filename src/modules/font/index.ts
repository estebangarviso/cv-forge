export type { CustomFont, CustomFontMeta } from './domain/entities/custom-font';
export {
	CustomFontMetaSchema,
	CustomFontSchema,
} from './domain/entities/custom-font';
export type { FontRepository } from './domain/interfaces/font-repository.interface';
export {
	InvalidFontError,
	MAX_FONT_SIZE_BYTES,
	validateFontBuffer,
} from './infrastructure/font-validation';
export { getFontRepository } from './infrastructure/font.factory';

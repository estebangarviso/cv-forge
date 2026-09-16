export type {
	CvData,
	JobEntry,
	OtherIcon,
	RefEntry,
	SideEntry,
	Skill,
} from './domain/entities/cv-data';
export {
	CvDataSchema,
	EMPTY_CV,
	JobEntrySchema,
	OTHER_ICON_OPTIONS,
	RefEntrySchema,
	resolveOtherIcon,
	SideEntrySchema,
	SkillSchema,
} from './domain/entities/cv-data';
export type { TemplateConfig } from './domain/entities/template-config';
export type {
	ResolvedTypographyStyle,
	Typography,
	TypographyFeatures,
	TypographyRole,
	TypographyRoleOverride,
} from './domain/entities/template-config';
export {
	DEFAULT_TEMPLATE,
	DEFAULT_TYPOGRAPHY,
	resolveTypography,
	TemplateConfigSchema,
	TYPOGRAPHY_ROLES,
	TypographyFeaturesSchema,
	TypographyRoleOverrideSchema,
	TypographyRoleSchema,
	TypographySchema,
} from './domain/entities/template-config';
export type { CvRepository } from './domain/interfaces/cv-repository.interface';
export { DuplicateCvUseCase } from './domain/use-cases/duplicate-cv.use-case';
export { CvForm } from './presentation/components/cv-form';
export { CvPdfDocument } from './presentation/components/cv-pdf-document';
export { ThemeDialog } from './presentation/components/theme-dialog';
export { TypographyDialog } from './presentation/components/typography-dialog';
export {
	DuplicateFontError,
	useCustomFont,
	useDeleteFont,
	useFontsList,
	useUploadFont,
} from './presentation/hooks/use-custom-font';
export {
	useCreateCv,
	useCv,
	useCvList,
	useDeleteCv,
	useDuplicateCv,
	useSaveCv,
} from './presentation/hooks/use-cv';
export { useCvEditorStore } from './presentation/state/cv-editor.store';

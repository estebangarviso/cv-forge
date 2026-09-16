import { z } from 'zod';

export const SkillSchema = z.object({
	label: z.string().min(1),
	level: z.number().min(0).max(100),
	subtitle: z.string().optional(),
});

export const SideEntrySchema = z.object({
	subtitle: z.string(),
	title: z.string().min(1),
});

export const JobEntrySchema = z.object({
	bullets: z.array(z.string()),
	details: z.string(),
	role: z.string().min(1),
});

export const RefEntrySchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	phone: z.string(),
});

export const CvDataSchema = z.object({
	aboutMe: z.string(),
	city: z.string(),
	courses: z.array(SideEntrySchema),
	createdAt: z.string().datetime().optional(),
	drivingLicense: z.string().optional(),
	education: z.array(SideEntrySchema),
	email: z.string().email(),
	experience: z.array(JobEntrySchema),
	extracurricular: z.array(SideEntrySchema),
	id: z.string().uuid().optional(),
	languages: z.array(SkillSchema),
	linkedinUrl: z.string().url().optional(),
	name: z.string().min(1),
	phone: z.string(),
	references: z.array(RefEntrySchema),
	skills: z.array(SkillSchema),
	title: z.string(),
	updatedAt: z.string().datetime().optional(),
});

export type CvData = z.infer<typeof CvDataSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SideEntry = z.infer<typeof SideEntrySchema>;
export type JobEntry = z.infer<typeof JobEntrySchema>;
export type RefEntry = z.infer<typeof RefEntrySchema>;

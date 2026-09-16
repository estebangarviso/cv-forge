import { z } from 'zod';

export const TemplateConfigSchema = z.object({
	colors: z.object({
		accent: z.string(),
		muted: z.string(),
		sidebarBg: z.string(),
	}),
	id: z.string(),
	name: z.string(),
	sidebarWidth: z.number().default(29),
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

export const DEFAULT_TEMPLATE: TemplateConfig = {
	colors: { accent: '#1A1A2E', muted: '#555555', sidebarBg: '#D4EDEC' },
	id: 'meli-v1',
	name: 'Profesional Teal',
	sidebarWidth: 29,
};

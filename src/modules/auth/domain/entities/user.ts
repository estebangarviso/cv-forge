import { z } from 'zod';

export const UserSchema = z.object({
	email: z.string().email(),
	id: z.string().uuid(),
	name: z.string().min(1),
	role: z.enum(['admin', 'operator', 'viewer']),
	tenantId: z.string().uuid(),
});

export type User = z.infer<typeof UserSchema>;

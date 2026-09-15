import { z } from 'zod';

import { UserSchema } from './user';

export const SessionSchema = z.object({
	accessToken: z.string(),
	expiresAt: z.number(),
	refreshToken: z.string(),
	user: UserSchema,
});

export type Session = z.infer<typeof SessionSchema>;

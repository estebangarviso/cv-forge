# Mappers and boundary validation

Every module maps wire → domain in **one** namespaced mapper object. Wire types/schemas stay file-private; domain output always goes through the entity Zod schema.

## Rules

| Rule            | Detail                                                                |
| --------------- | --------------------------------------------------------------------- |
| One mapper      | Prefer a single `XxxMapper` object with named methods per wire shape  |
| Wire private    | DTO types and wire Zod schemas are not exported from the mapper file  |
| Domain parse    | Always `EntitySchema.parse(...)` before leaving infrastructure        |
| Repository role | Call the mapper; never import or parse wire schemas in the repository |

## Reference implementation

```typescript
// src/modules/auth/infrastructure/mappers/session.mapper.ts

import { z } from 'zod';
import { UserSchema, type User } from '../../domain/entities/user';

// Wire schema — file-private, never exported
const WireSessionSchema = z.object({
	id: z.string(),
	user_name: z.string(),
	user_email: z.string().email(),
});

export const SessionMapper = {
	toDomain(wire: unknown): User {
		const parsed = WireSessionSchema.parse(wire);
		return UserSchema.parse({
			id: parsed.id,
			name: parsed.user_name,
			email: parsed.user_email,
		});
	},
};
```

## Checklist

- [ ] Exactly one mapper file per wire shape
- [ ] Wire schemas and DTO types are file-private
- [ ] Domain output always parsed with entity schema
- [ ] Repositories call mapper; they never import wire schemas

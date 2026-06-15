import { z } from "@hono/zod-openapi";

export const OrganizationResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		createdAt: z.instanceof(Date),
		updatedAt: z.instanceof(Date),
	})
	.openapi("Organization");

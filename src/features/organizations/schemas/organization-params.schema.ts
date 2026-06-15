import { z } from "@hono/zod-openapi";

export const OrganizationIdParamsSchema = z.object({
	id: z.uuid().openapi({
		param: {
			name: "id",
			in: "path",
		},
		example: crypto.randomUUID(),
	}),
});

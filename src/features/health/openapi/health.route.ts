import { createRoute } from "@hono/zod-openapi";

import { HealthResponseSchema } from "../schemas/health-response.schema";

export const healthRoute = createRoute({
	method: "get",
	path: "/health",

	tags: ["System"],

	summary: "Health check",

	description: "Returns the current health status of the API.",

	responses: {
		200: {
			description: "API is healthy.",
			content: {
				"application/json": {
					schema: HealthResponseSchema,
				},
			},
		},
	},
});

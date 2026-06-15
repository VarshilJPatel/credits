import { OpenAPIHono } from "@hono/zod-openapi";

export const createRouter = () =>
	new OpenAPIHono({
		defaultHook: (result, c) => {
			if (result.success) {
				return;
			}

			return c.json(
				{
					error: {
						code: "VALIDATION_ERROR",
						message: "Invalid request",
						issues: result.error.issues,
					},
				},
				400,
			);
		},
	});

import { OpenAPIHono } from "@hono/zod-openapi";
import { healthRoute } from "../openapi/health.route";

export const createHealthRoutes = () => {
	const app = new OpenAPIHono();

	app.openapi(healthRoute, (c) => {
		return c.json(
			{
				data: {
					status: "ok",
				},
			},
			200,
		);
	});

	return app;
};

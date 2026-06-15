import { swaggerUI } from "@hono/swagger-ui";
import { createHealthRoutes } from "@/features/health";
import { organizationRoutes } from "@/features/organizations";
import { openApiConfig } from "./openapi";
import { createRouter } from "./openapi-hono";

export const createApp = () => {
	const app = createRouter();

	app.route("/", createHealthRoutes());

	app.route("/organizations", organizationRoutes());

	app.doc31("/openapi.json", openApiConfig);

	app.get(
		"/docs",
		swaggerUI({
			url: "/openapi.json",
		}),
	);

	return app;
};

import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { createOrganizationRoutes } from "@/features/organizations";

export const createApp = () => {
	const app = new Hono();

	app.get("/health", (c) =>
		c.json({
			data: {
				status: "ok",
			},
		}),
	);

	app.route("/organizations", createOrganizationRoutes());
	app.route("/tenants", createOrganizationRoutes());

	app.get(
		"/openapi.json",
		openAPIRouteHandler(app, {
			documentation: {
				openapi: "3.1.0",
				info: {
					title: "UsageCredits API",
					version: "0.1.0",
					description:
						"Infrastructure API for SaaS companies to create organizations, issue API keys, and manage credit-based billing primitives.",
				},
				servers: [
					{
						url: "http://localhost:3000",
						description: "Local development",
					},
				],
				tags: [
					{
						name: "Organizations",
						description:
							"Tenant organization management and API-key authentication.",
					},
				],
			},
		}),
	);

	app.get(
		"/docs",
		swaggerUI({
			url: "/openapi.json",
		}),
	);

	return app;
};

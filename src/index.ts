import { Hono } from "hono";
import { createOrganizationRoutes } from "@/features/organizations";
import { env } from "./env";

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

export default {
	port: env.PORT,
	fetch: app.fetch,
};

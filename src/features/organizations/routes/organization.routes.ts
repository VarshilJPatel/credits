import { createRouter } from "@/app/openapi-hono";
import { db } from "@/database/client";
import { createOrganizationRoute } from "../openapi/create-organization.route";
import { getOrganizationRoute } from "../openapi/get-organization.route";
import { updateOrganizationRoute } from "../openapi/update-organization.route";
import { OrganizationRepository } from "../repositories/organization.repository";
import { OrganizationService } from "../services/organization.service";

export const organizationRoutes = () => {
	const app = createRouter();
	const repository = new OrganizationRepository(db);
	const service = new OrganizationService(repository);

	app.openapi(createOrganizationRoute, async (c) => {
		const { name } = c.req.valid("json");
		const organization = await service.create({ name });
		return c.json(
			{
				data: organization,
			},
			201,
		);
	});

	app.openapi(updateOrganizationRoute, async (c) => {
		const body = c.req.valid("json");
		const { id } = c.req.valid("param");
		const organization = await service.update(id, body);
		return c.json(
			{
				data: organization,
			},
			200,
		);
	});

	app.openapi(getOrganizationRoute, async (c) => {
		const { id } = c.req.valid("param");
		const organization = await service.getById(id);
		return c.json(
			{
				data: organization,
			},
			200,
		);
	});

	return app;
};

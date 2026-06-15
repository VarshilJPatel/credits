import { createRoute } from "@hono/zod-openapi";
import { createSuccessResponseSchema } from "@/shared/responses/api-response.schema";
import { CreateOrganizationRequestSchema } from "../schemas/organization-request.schema";
import { OrganizationResponseSchema } from "../schemas/organization-response.schema";

export const createOrganizationRoute = createRoute({
	method: "post",
	path: "/",

	tags: ["Organizations"],

	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateOrganizationRequestSchema,
				},
			},
			required: true,
		},
	},

	responses: {
		201: {
			description: "Organization created",
			content: {
				"application/json": {
					schema: createSuccessResponseSchema(OrganizationResponseSchema),
				},
			},
		},
	},
});

import { createRoute } from "@hono/zod-openapi";
import {
	createErrorResponseSchema,
	createSuccessResponseSchema,
} from "@/shared/responses/api-response.schema";
import { OrganizationIdParamsSchema } from "../schemas/organization-params.schema";
import { OrganizationResponseSchema } from "../schemas/organization-response.schema";

export const getOrganizationRoute = createRoute({
	method: "get",
	path: "/{id}",

	tags: ["Organizations"],

	summary: "Get organization",

	request: {
		params: OrganizationIdParamsSchema,
	},

	responses: {
		200: {
			description: "Organization found",
			content: {
				"application/json": {
					schema: createSuccessResponseSchema(OrganizationResponseSchema),
				},
			},
		},

		404: {
			description: "Organization not found.",
			content: {
				"application/json": {
					schema: createErrorResponseSchema(),
				},
			},
		},
	},
});

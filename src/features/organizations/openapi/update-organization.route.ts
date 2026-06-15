import { createRoute } from "@hono/zod-openapi";
import {
	createErrorResponseSchema,
	createSuccessResponseSchema,
	createValidationErrorResponseSchema,
} from "@/shared/responses/api-response.schema";
import { OrganizationIdParamsSchema } from "../schemas/organization-params.schema";
import { UpdateOrganizationRequestSchema } from "../schemas/organization-request.schema";
import { OrganizationResponseSchema } from "../schemas/organization-response.schema";

export const updateOrganizationRoute = createRoute({
	method: "patch",
	path: "/{id}",

	tags: ["Organizations"],

	summary: "Update organization",

	request: {
		params: OrganizationIdParamsSchema,
		body: {
			content: {
				"application/json": {
					schema: UpdateOrganizationRequestSchema,
				},
			},
			required: true,
		},
	},

	responses: {
		200: {
			description: "Organization updated.",

			content: {
				"application/json": {
					schema: createSuccessResponseSchema(OrganizationResponseSchema),
				},
			},
		},

		400: {
			description: "Validation error.",

			content: {
				"application/json": {
					schema: createValidationErrorResponseSchema(),
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

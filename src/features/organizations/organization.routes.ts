import { type Hook, zValidator } from "@hono/zod-validator";
import { type Env, Hono, type ValidationTargets } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import {
	createOrganizationController,
	handleOrganizationError,
} from "./organization.controller";
import { OrganizationRepository } from "./organization.repository";
import {
	authenticateOrganizationRequestSchema,
	createdOrganizationResponseSchema,
	createOrganizationRequestSchema,
	errorResponseSchema,
	organizationIdParamSchema,
	publicOrganizationResponseSchema,
	updateOrganizationRequestSchema,
	validationErrorResponseSchema,
} from "./organization.schema";
import {
	OrganizationService,
	type OrganizationServiceContract,
} from "./organization.service";

type CreateOrganizationRoutesOptions = {
	organizationService?: OrganizationServiceContract;
};

const organizationTags = ["Organizations"];

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
	"application/json": {
		schema: resolver(schema),
	},
});

const idPathParameter = {
	name: "id",
	in: "path",
	required: true,
	schema: {
		type: "string",
		format: "uuid",
	},
	description: "Organization identifier.",
} as const;

const validationErrorSpecResponse = {
	description: "Request validation failed.",
	content: jsonContent(validationErrorResponseSchema),
};

const organizationNotFoundResponse = {
	description: "Organization was not found.",
	content: jsonContent(errorResponseSchema),
};

const handleValidationError: Hook<
	unknown,
	Env,
	string,
	keyof ValidationTargets
> = (result, c) => {
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
};

export const createOrganizationRoutes = ({
	organizationService = new OrganizationService(new OrganizationRepository()),
}: CreateOrganizationRoutesOptions = {}) => {
	const organizationRoutes = new Hono();
	const organizationController = createOrganizationController({
		organizationService,
	});

	organizationRoutes.post(
		"/",
		describeRoute({
			tags: organizationTags,
			summary: "Create organization",
			description:
				"Creates an organization and returns its API key. The API key is only exposed on creation.",
			requestBody: {
				required: true,
				content: jsonContent(createOrganizationRequestSchema),
			},
			responses: {
				201: {
					description: "Organization created.",
					content: jsonContent(createdOrganizationResponseSchema),
				},
				400: validationErrorSpecResponse,
			},
		}),
		zValidator("json", createOrganizationRequestSchema, handleValidationError),
		async (c) => {
			try {
				const data = await organizationController.create(c.req.valid("json"));

				return c.json({ data }, 201);
			} catch (error) {
				return handleOrganizationError(error, c);
			}
		},
	);

	organizationRoutes.post(
		"/authenticate",
		describeRoute({
			tags: organizationTags,
			summary: "Authenticate organization API key",
			description:
				"Validates an organization API key and returns the active organization without exposing the key.",
			requestBody: {
				required: true,
				content: jsonContent(authenticateOrganizationRequestSchema),
			},
			responses: {
				200: {
					description: "API key is valid.",
					content: jsonContent(publicOrganizationResponseSchema),
				},
				400: validationErrorSpecResponse,
				401: {
					description:
						"API key is missing, invalid, or belongs to an inactive organization.",
					content: jsonContent(errorResponseSchema),
				},
			},
		}),
		zValidator(
			"json",
			authenticateOrganizationRequestSchema,
			handleValidationError,
		),
		async (c) => {
			try {
				const { apiKey } = c.req.valid("json");
				const data = await organizationController.authenticate(apiKey);

				return c.json({ data });
			} catch (error) {
				return handleOrganizationError(error, c);
			}
		},
	);

	organizationRoutes.get(
		"/:id",
		describeRoute({
			tags: organizationTags,
			summary: "Get organization",
			parameters: [idPathParameter],
			responses: {
				200: {
					description: "Organization found.",
					content: jsonContent(publicOrganizationResponseSchema),
				},
				400: validationErrorSpecResponse,
				404: organizationNotFoundResponse,
			},
		}),
		zValidator("param", organizationIdParamSchema, handleValidationError),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = await organizationController.getById(id);

				return c.json({ data });
			} catch (error) {
				return handleOrganizationError(error, c);
			}
		},
	);

	organizationRoutes.patch(
		"/:id",
		describeRoute({
			tags: organizationTags,
			summary: "Update organization",
			parameters: [idPathParameter],
			requestBody: {
				required: true,
				content: jsonContent(updateOrganizationRequestSchema),
			},
			responses: {
				200: {
					description: "Organization updated.",
					content: jsonContent(publicOrganizationResponseSchema),
				},
				400: validationErrorSpecResponse,
				404: organizationNotFoundResponse,
			},
		}),
		zValidator("param", organizationIdParamSchema, handleValidationError),
		zValidator("json", updateOrganizationRequestSchema, handleValidationError),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = await organizationController.update(
					id,
					c.req.valid("json"),
				);

				return c.json({ data });
			} catch (error) {
				return handleOrganizationError(error, c);
			}
		},
	);

	organizationRoutes.delete(
		"/:id",
		describeRoute({
			tags: organizationTags,
			summary: "Deactivate organization",
			description:
				"Soft-deactivates an organization by setting `isActive` to false.",
			parameters: [idPathParameter],
			responses: {
				200: {
					description: "Organization deactivated.",
					content: jsonContent(publicOrganizationResponseSchema),
				},
				400: validationErrorSpecResponse,
				404: organizationNotFoundResponse,
			},
		}),
		zValidator("param", organizationIdParamSchema, handleValidationError),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = await organizationController.deactivate(id);

				return c.json({ data });
			} catch (error) {
				return handleOrganizationError(error, c);
			}
		},
	);

	return organizationRoutes;
};

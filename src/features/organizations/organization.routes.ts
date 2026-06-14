import { type Hook, zValidator } from "@hono/zod-validator";
import { type Env, Hono, type ValidationTargets } from "hono";
import {
	createOrganizationController,
	handleOrganizationError,
} from "./organization.controller";
import { OrganizationRepository } from "./organization.repository";
import {
	authenticateOrganizationRequestSchema,
	createOrganizationRequestSchema,
	organizationIdParamSchema,
	updateOrganizationRequestSchema,
} from "./organization.schema";
import {
	OrganizationService,
	type OrganizationServiceContract,
} from "./organization.service";

type CreateOrganizationRoutesOptions = {
	organizationService?: OrganizationServiceContract;
};

const validationErrorResponse: Hook<
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
		zValidator(
			"json",
			createOrganizationRequestSchema,
			validationErrorResponse,
		),
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
		zValidator(
			"json",
			authenticateOrganizationRequestSchema,
			validationErrorResponse,
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
		zValidator("param", organizationIdParamSchema, validationErrorResponse),
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
		zValidator("param", organizationIdParamSchema, validationErrorResponse),
		zValidator(
			"json",
			updateOrganizationRequestSchema,
			validationErrorResponse,
		),
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
		zValidator("param", organizationIdParamSchema, validationErrorResponse),
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

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Organization } from "./organization.repository";
import type {
	CreateOrganizationRequest,
	UpdateOrganizationRequest,
} from "./organization.schema";
import type { OrganizationServiceContract } from "./organization.service";

type OrganizationControllerDependencies = {
	organizationService: OrganizationServiceContract;
};

const toPublicOrganization = (organization: Organization) => ({
	id: organization.id,
	name: organization.name,
	isActive: organization.isActive,
	createdAt: organization.createdAt,
	updatedAt: organization.updatedAt,
});

const toCreatedOrganization = (organization: Organization) => ({
	...toPublicOrganization(organization),
	apiKey: organization.apiKey,
});

const errorResponse = (
	c: Context,
	status: ContentfulStatusCode,
	code: string,
	message: string,
) =>
	c.json(
		{
			error: {
				code,
				message,
			},
		},
		status,
	);

export const handleOrganizationError = (error: unknown, c: Context) => {
	if (!(error instanceof Error)) {
		throw error;
	}

	if (error.message === "Organization not found") {
		return errorResponse(c, 404, "ORGANIZATION_NOT_FOUND", error.message);
	}

	if (error.message === "Invalid API key") {
		return errorResponse(c, 401, "INVALID_API_KEY", error.message);
	}

	throw error;
};

export const createOrganizationController = ({
	organizationService,
}: OrganizationControllerDependencies) => ({
	create: async (input: CreateOrganizationRequest) => {
		const organization = await organizationService.createOrganization(input);

		return toCreatedOrganization(organization);
	},

	getById: async (id: string) => {
		const organization = await organizationService.getOrganization(id);

		return toPublicOrganization(organization);
	},

	update: async (id: string, input: UpdateOrganizationRequest) => {
		const organization = await organizationService.updateOrganization(
			id,
			input,
		);

		return toPublicOrganization(organization);
	},

	authenticate: async (apiKey: string) => {
		const organization =
			await organizationService.authenticateWithApiKey(apiKey);

		return toPublicOrganization(organization);
	},

	deactivate: async (id: string) => {
		const organization = await organizationService.deactivateOrganization(id);

		return toPublicOrganization(organization);
	},
});

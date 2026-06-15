import type { Organization } from "../repositories/organization.repository";
import { OrganizationResponseSchema } from "../schemas/organization-response.schema";

export const toOrganizationResponse = (organization: Organization) =>
	OrganizationResponseSchema.parse(organization);

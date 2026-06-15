import { NotFoundError } from "@/shared/errors/not-found-error";
import { generateApiKey } from "@/shared/utils/api-key";
import { toOrganizationResponse } from "../mappers/organization.mapper";
import type {
	CreateOrganizationInput,
	OrganizationRepository,
	UpdateOrganizationInput,
} from "../repositories/organization.repository";

export class OrganizationService {
	constructor(private readonly repository: OrganizationRepository) {}

	async create({ name }: Omit<CreateOrganizationInput, "apiKey">) {
		const organization = await this.repository.create({
			name,
			apiKey: generateApiKey(),
		});

		if (!organization) {
			throw new NotFoundError("Organization not found");
		}

		return toOrganizationResponse(organization);
	}

	async update(id: string, { isActive, name }: UpdateOrganizationInput) {
		const organization = await this.repository.update(id, {
			name,
			isActive,
		});

		if (!organization) {
			throw new NotFoundError("Organization not found");
		}

		return toOrganizationResponse(organization);
	}

	async getById(id: string) {
		const organization = await this.repository.findById(id);

		if (!organization) {
			throw new NotFoundError("Organization not found");
		}

		return toOrganizationResponse(organization);
	}
}

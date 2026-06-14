import type {
	OrganizationRepositoryContract,
	UpdateOrganizationInput,
} from "./organization.repository";

export type CreateOrganizationServiceInput = {
	name: string;
	apiKey?: string;
};

export type UpdateOrganizationServiceInput = UpdateOrganizationInput;

export class OrganizationService {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryContract,
	) {}

	async createOrganization(input: CreateOrganizationServiceInput) {
		return this.organizationRepository.create({
			name: input.name,
			apiKey: input.apiKey ?? this.generateApiKey(),
		});
	}

	async getOrganization(id: string) {
		const organization = await this.organizationRepository.findById(id);

		if (!organization) {
			throw new Error("Organization not found");
		}

		return organization;
	}

	async updateOrganization(id: string, input: UpdateOrganizationServiceInput) {
		const organization = await this.organizationRepository.update(id, input);

		if (!organization) {
			throw new Error("Organization not found");
		}

		return organization;
	}

	async authenticateWithApiKey(apiKey: string) {
		const organization = await this.organizationRepository.findByApiKey(apiKey);

		if (!organization?.isActive) {
			throw new Error("Invalid API key");
		}

		return organization;
	}

	async deactivateOrganization(id: string) {
		const organization = await this.organizationRepository.deactivate(id);

		if (!organization) {
			throw new Error("Organization not found");
		}

		return organization;
	}

	private generateApiKey() {
		return `sk_live_${crypto.randomUUID().replaceAll("-", "")}`;
	}
}

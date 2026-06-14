import type {
	Organization,
	OrganizationRepositoryContract,
	UpdateOrganizationInput,
} from "./organization.repository";

export type CreateOrganizationServiceInput = {
	name: string;
	apiKey?: string;
};

export type UpdateOrganizationServiceInput = UpdateOrganizationInput;

export type OrganizationServiceContract = {
	createOrganization(
		input: CreateOrganizationServiceInput,
	): Promise<Organization>;
	getOrganization(id: string): Promise<Organization>;
	updateOrganization(
		id: string,
		input: UpdateOrganizationServiceInput,
	): Promise<Organization>;
	authenticateWithApiKey(apiKey: string): Promise<Organization>;
	deactivateOrganization(id: string): Promise<Organization>;
};

export class OrganizationService implements OrganizationServiceContract {
	constructor(
		private readonly organizationRepository: OrganizationRepositoryContract,
	) {}

	async createOrganization(input: CreateOrganizationServiceInput) {
		const organization = await this.organizationRepository.create({
			name: input.name,
			apiKey: input.apiKey ?? this.generateApiKey(),
		});

		if (!organization) {
			throw new Error("Organization could not be created");
		}

		return organization;
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

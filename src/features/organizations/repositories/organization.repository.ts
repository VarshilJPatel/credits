import { eq } from "drizzle-orm";
import type { DBClient } from "@/database/client";
import { organizations } from "@/database/schema/organization";

export type Organization = typeof organizations.$inferSelect;
export type CreateOrganizationInput = Pick<Organization, "name" | "apiKey">;
export type UpdateOrganizationInput = Partial<
	Pick<Organization, "name" | "apiKey" | "isActive">
>;

export class OrganizationRepository {
	constructor(private readonly dbClient: DBClient) {}

	async create(input: CreateOrganizationInput) {
		const [organization] = await this.dbClient
			.insert(organizations)
			.values(input)
			.returning();

		return organization;
	}

	async findById(id: string) {
		const [organization] = await this.dbClient
			.select()
			.from(organizations)
			.where(eq(organizations.id, id))
			.limit(1);

		return organization;
	}

	async findByApiKey(apiKey: string) {
		const [organization] = await this.dbClient
			.select()
			.from(organizations)
			.where(eq(organizations.apiKey, apiKey))
			.limit(1);

		return organization;
	}

	async update(id: string, input: UpdateOrganizationInput) {
		const [organization] = await this.dbClient
			.update(organizations)
			.set(input)
			.where(eq(organizations.id, id))
			.returning();

		return organization;
	}

	async deactivate(id: string) {
		return this.update(id, { isActive: false });
	}
}

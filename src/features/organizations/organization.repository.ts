import { eq } from "drizzle-orm";
import type { db } from "@/db";
import { organizations } from "@/db/schema/organization";

export type Organization = typeof organizations.$inferSelect;
type DbClient = typeof db;
export type CreateOrganizationInput = Pick<Organization, "name" | "apiKey">;
export type UpdateOrganizationInput = Partial<
	Pick<Organization, "name" | "apiKey" | "isActive">
>;

export type OrganizationRepositoryContract = {
	create(input: CreateOrganizationInput): Promise<Organization | undefined>;
	findById(id: string): Promise<Organization | undefined>;
	findByApiKey(apiKey: string): Promise<Organization | undefined>;
	update(
		id: string,
		input: UpdateOrganizationInput,
	): Promise<Organization | undefined>;
	deactivate(id: string): Promise<Organization | undefined>;
};

export class OrganizationRepository {
	constructor(private readonly dbClient?: DbClient) {}

	async create(input: CreateOrganizationInput) {
		const dbClient = await this.getDbClient();
		const [organization] = await dbClient
			.insert(organizations)
			.values(input)
			.returning();

		return organization;
	}

	async findById(id: string) {
		const dbClient = await this.getDbClient();
		const [organization] = await dbClient
			.select()
			.from(organizations)
			.where(eq(organizations.id, id))
			.limit(1);

		return organization;
	}

	async findByApiKey(apiKey: string) {
		const dbClient = await this.getDbClient();
		const [organization] = await dbClient
			.select()
			.from(organizations)
			.where(eq(organizations.apiKey, apiKey))
			.limit(1);

		return organization;
	}

	async update(id: string, input: UpdateOrganizationInput) {
		const dbClient = await this.getDbClient();
		const [organization] = await dbClient
			.update(organizations)
			.set(input)
			.where(eq(organizations.id, id))
			.returning();

		return organization;
	}

	async deactivate(id: string) {
		return this.update(id, { isActive: false });
	}

	private async getDbClient() {
		if (this.dbClient) {
			return this.dbClient;
		}

		const { db: dbClient } = await import("@/db");
		return dbClient;
	}
}

import { describe, expect, test } from "bun:test";
import { organizations } from "@/db/schema/organization";
import {
	type CreateOrganizationInput,
	type Organization,
	OrganizationRepository,
	type UpdateOrganizationInput,
} from "./organization.repository";

type RepositoryDbClient = ConstructorParameters<
	typeof OrganizationRepository
>[0];

const createOrganization = (
	overrides: Partial<Organization> = {},
): Organization => ({
	id: "org_123",
	name: "Acme AI",
	apiKey: "sk_live_test",
	isActive: true,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
	...overrides,
});

const createRepositoryDbClient = (result: Organization | undefined) => {
	const calls: {
		insertTable?: unknown;
		insertValues?: CreateOrganizationInput;
		selectTable?: unknown;
		updateTable?: unknown;
		updateValues?: UpdateOrganizationInput;
		whereClauseCount: number;
		limitValue?: number;
	} = {
		whereClauseCount: 0,
	};

	const dbClient = {
		insert(table: unknown) {
			calls.insertTable = table;

			return {
				values(input: CreateOrganizationInput) {
					calls.insertValues = input;

					return {
						async returning() {
							return result ? [result] : [];
						},
					};
				},
			};
		},
		select() {
			return {
				from(table: unknown) {
					calls.selectTable = table;

					return {
						where(_clause: unknown) {
							calls.whereClauseCount += 1;

							return {
								async limit(value: number) {
									calls.limitValue = value;
									return result ? [result] : [];
								},
							};
						},
					};
				},
			};
		},
		update(table: unknown) {
			calls.updateTable = table;

			return {
				set(input: UpdateOrganizationInput) {
					calls.updateValues = input;

					return {
						where(_clause: unknown) {
							calls.whereClauseCount += 1;

							return {
								async returning() {
									return result ? [result] : [];
								},
							};
						},
					};
				},
			};
		},
	} as unknown as RepositoryDbClient;

	return { calls, dbClient };
};

describe("OrganizationRepository", () => {
	test("creates an organization row", async () => {
		const row = createOrganization({ name: "Acme AI" });
		const { calls, dbClient } = createRepositoryDbClient(row);
		const repository = new OrganizationRepository(dbClient);

		await expect(
			repository.create({ name: "Acme AI", apiKey: "sk_live_test" }),
		).resolves.toBe(row);
		expect(calls.insertTable).toBe(organizations);
		expect(calls.insertValues).toEqual({
			name: "Acme AI",
			apiKey: "sk_live_test",
		});
	});

	test("finds an organization by id with a single-row query", async () => {
		const row = createOrganization({ id: "org_found" });
		const { calls, dbClient } = createRepositoryDbClient(row);
		const repository = new OrganizationRepository(dbClient);

		await expect(repository.findById("org_found")).resolves.toBe(row);
		expect(calls.selectTable).toBe(organizations);
		expect(calls.whereClauseCount).toBe(1);
		expect(calls.limitValue).toBe(1);
	});

	test("finds an organization by API key with a single-row query", async () => {
		const row = createOrganization({ apiKey: "sk_live_valid" });
		const { calls, dbClient } = createRepositoryDbClient(row);
		const repository = new OrganizationRepository(dbClient);

		await expect(repository.findByApiKey("sk_live_valid")).resolves.toBe(row);
		expect(calls.selectTable).toBe(organizations);
		expect(calls.whereClauseCount).toBe(1);
		expect(calls.limitValue).toBe(1);
	});

	test("updates an organization row", async () => {
		const row = createOrganization({ name: "Renamed" });
		const { calls, dbClient } = createRepositoryDbClient(row);
		const repository = new OrganizationRepository(dbClient);

		await expect(
			repository.update("org_123", { name: "Renamed" }),
		).resolves.toBe(row);
		expect(calls.updateTable).toBe(organizations);
		expect(calls.updateValues).toEqual({ name: "Renamed" });
		expect(calls.whereClauseCount).toBe(1);
	});

	test("deactivates an organization through the update path", async () => {
		const row = createOrganization({ isActive: false });
		const { calls, dbClient } = createRepositoryDbClient(row);
		const repository = new OrganizationRepository(dbClient);

		await expect(repository.deactivate("org_123")).resolves.toBe(row);
		expect(calls.updateValues).toEqual({ isActive: false });
	});

	test("returns undefined when no row is found", async () => {
		const { dbClient } = createRepositoryDbClient(undefined);
		const repository = new OrganizationRepository(dbClient);

		await expect(repository.findById("missing")).resolves.toBeUndefined();
		await expect(
			repository.update("missing", { name: "Renamed" }),
		).resolves.toBeUndefined();
	});
});

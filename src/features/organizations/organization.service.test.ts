import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	CreateOrganizationInput,
	Organization,
	OrganizationRepositoryContract,
	UpdateOrganizationInput,
} from "./organization.repository";
import { OrganizationService } from "./organization.service";

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

class FakeOrganizationRepository implements OrganizationRepositoryContract {
	create = mock(
		async (input: CreateOrganizationInput): Promise<Organization> =>
			createOrganization(input),
	);

	findById = mock(
		async (_id: string): Promise<Organization | undefined> =>
			createOrganization(),
	);

	findByApiKey = mock(
		async (_apiKey: string): Promise<Organization | undefined> =>
			createOrganization(),
	);

	update = mock(
		async (
			_id: string,
			input: UpdateOrganizationInput,
		): Promise<Organization | undefined> => createOrganization(input),
	);

	deactivate = mock(
		async (_id: string): Promise<Organization | undefined> =>
			createOrganization({ isActive: false }),
	);
}

describe("OrganizationService", () => {
	let repository: FakeOrganizationRepository;
	let service: OrganizationService;

	beforeEach(() => {
		repository = new FakeOrganizationRepository();
		service = new OrganizationService(repository);
	});

	test("creates an organization with an explicit API key", async () => {
		const organization = await service.createOrganization({
			name: "Acme AI",
			apiKey: "sk_live_custom",
		});

		expect(repository.create).toHaveBeenCalledWith({
			name: "Acme AI",
			apiKey: "sk_live_custom",
		});
		expect(organization).toMatchObject({
			name: "Acme AI",
			apiKey: "sk_live_custom",
		});
	});

	test("generates a production-shaped API key when one is not provided", async () => {
		await service.createOrganization({ name: "Acme AI" });

		const createInput = repository.create.mock.calls[0]?.[0];

		expect(createInput?.name).toBe("Acme AI");
		expect(createInput?.apiKey).toMatch(/^sk_live_[a-f0-9]{32}$/);
	});

	test("returns an organization by id", async () => {
		const organization = createOrganization({ id: "org_found" });
		repository.findById.mockImplementationOnce(async () => organization);

		await expect(service.getOrganization("org_found")).resolves.toBe(
			organization,
		);
		expect(repository.findById).toHaveBeenCalledWith("org_found");
	});

	test("throws when an organization id does not exist", async () => {
		repository.findById.mockImplementationOnce(async () => undefined);

		await expect(service.getOrganization("missing")).rejects.toThrow(
			"Organization not found",
		);
	});

	test("updates an organization", async () => {
		const organization = createOrganization({ name: "Renamed" });
		repository.update.mockImplementationOnce(async () => organization);

		await expect(
			service.updateOrganization("org_123", { name: "Renamed" }),
		).resolves.toBe(organization);
		expect(repository.update).toHaveBeenCalledWith("org_123", {
			name: "Renamed",
		});
	});

	test("throws when updating a missing organization", async () => {
		repository.update.mockImplementationOnce(async () => undefined);

		await expect(
			service.updateOrganization("missing", { name: "Renamed" }),
		).rejects.toThrow("Organization not found");
	});

	test("authenticates an active organization by API key", async () => {
		const organization = createOrganization({ apiKey: "sk_live_valid" });
		repository.findByApiKey.mockImplementationOnce(async () => organization);

		await expect(service.authenticateWithApiKey("sk_live_valid")).resolves.toBe(
			organization,
		);
		expect(repository.findByApiKey).toHaveBeenCalledWith("sk_live_valid");
	});

	test("rejects a missing API key", async () => {
		repository.findByApiKey.mockImplementationOnce(async () => undefined);

		await expect(
			service.authenticateWithApiKey("sk_live_missing"),
		).rejects.toThrow("Invalid API key");
	});

	test("rejects an inactive organization during API key authentication", async () => {
		repository.findByApiKey.mockImplementationOnce(async () =>
			createOrganization({ isActive: false }),
		);

		await expect(
			service.authenticateWithApiKey("sk_live_inactive"),
		).rejects.toThrow("Invalid API key");
	});

	test("deactivates an organization", async () => {
		const organization = createOrganization({ isActive: false });
		repository.deactivate.mockImplementationOnce(async () => organization);

		await expect(service.deactivateOrganization("org_123")).resolves.toBe(
			organization,
		);
		expect(repository.deactivate).toHaveBeenCalledWith("org_123");
	});

	test("throws when deactivating a missing organization", async () => {
		repository.deactivate.mockImplementationOnce(async () => undefined);

		await expect(service.deactivateOrganization("missing")).rejects.toThrow(
			"Organization not found",
		);
	});
});

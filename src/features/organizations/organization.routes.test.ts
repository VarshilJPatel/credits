import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import type { Organization } from "./organization.repository";
import { createOrganizationRoutes } from "./organization.routes";
import type {
	CreateOrganizationServiceInput,
	OrganizationServiceContract,
	UpdateOrganizationServiceInput,
} from "./organization.service";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";

const createOrganization = (
	overrides: Partial<Organization> = {},
): Organization => ({
	id: organizationId,
	name: "Acme AI",
	apiKey: "sk_live_test",
	isActive: true,
	createdAt: new Date("2026-01-01T00:00:00.000Z"),
	updatedAt: new Date("2026-01-01T00:00:00.000Z"),
	...overrides,
});

type ApiResponseBody = {
	data?: Record<string, unknown>;
	error?: {
		code: string;
	};
};

const parseBody = async (response: Response) =>
	(await response.json()) as ApiResponseBody;

class FakeOrganizationService implements OrganizationServiceContract {
	createOrganization = mock(
		async (input: CreateOrganizationServiceInput): Promise<Organization> =>
			createOrganization(input),
	);

	getOrganization = mock(
		async (_id: string): Promise<Organization> => createOrganization(),
	);

	updateOrganization = mock(
		async (
			_id: string,
			input: UpdateOrganizationServiceInput,
		): Promise<Organization> => createOrganization(input),
	);

	authenticateWithApiKey = mock(
		async (_apiKey: string): Promise<Organization> => createOrganization(),
	);

	deactivateOrganization = mock(
		async (_id: string): Promise<Organization> =>
			createOrganization({ isActive: false }),
	);
}

describe("organization routes", () => {
	let app: Hono;
	let organizationService: FakeOrganizationService;

	beforeEach(() => {
		app = new Hono();
		organizationService = new FakeOrganizationService();
		app.route(
			"/organizations",
			createOrganizationRoutes({ organizationService }),
		);
	});

	test("creates an organization and returns the API key once", async () => {
		const response = await app.request("/organizations", {
			method: "POST",
			body: JSON.stringify({ name: "Acme AI" }),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(201);
		expect(organizationService.createOrganization).toHaveBeenCalledWith({
			name: "Acme AI",
		});
		expect(body.data).toMatchObject({
			id: organizationId,
			name: "Acme AI",
			apiKey: "sk_live_test",
			isActive: true,
		});
	});

	test("rejects invalid create payloads", async () => {
		const response = await app.request("/organizations", {
			method: "POST",
			body: JSON.stringify({ name: "" }),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(400);
		expect(body.error?.code).toBe("VALIDATION_ERROR");
		expect(organizationService.createOrganization).not.toHaveBeenCalled();
	});

	test("gets an organization without exposing its API key", async () => {
		const response = await app.request(`/organizations/${organizationId}`);
		const body = await parseBody(response);

		expect(response.status).toBe(200);
		expect(organizationService.getOrganization).toHaveBeenCalledWith(
			organizationId,
		);
		expect(body.data?.name).toBe("Acme AI");
		expect(body.data?.apiKey).toBeUndefined();
	});

	test("rejects invalid organization ids", async () => {
		const response = await app.request("/organizations/not-a-uuid");
		const body = await parseBody(response);

		expect(response.status).toBe(400);
		expect(body.error?.code).toBe("VALIDATION_ERROR");
		expect(organizationService.getOrganization).not.toHaveBeenCalled();
	});

	test("returns 404 when an organization does not exist", async () => {
		organizationService.getOrganization.mockImplementationOnce(async () => {
			throw new Error("Organization not found");
		});

		const response = await app.request(`/organizations/${organizationId}`);
		const body = await parseBody(response);

		expect(response.status).toBe(404);
		expect(body.error?.code).toBe("ORGANIZATION_NOT_FOUND");
	});

	test("updates an organization", async () => {
		const response = await app.request(`/organizations/${organizationId}`, {
			method: "PATCH",
			body: JSON.stringify({ name: "Renamed", isActive: true }),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(200);
		expect(organizationService.updateOrganization).toHaveBeenCalledWith(
			organizationId,
			{ name: "Renamed", isActive: true },
		);
		expect(body.data?.apiKey).toBeUndefined();
	});

	test("rejects empty update payloads", async () => {
		const response = await app.request(`/organizations/${organizationId}`, {
			method: "PATCH",
			body: JSON.stringify({}),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(400);
		expect(body.error?.code).toBe("VALIDATION_ERROR");
		expect(organizationService.updateOrganization).not.toHaveBeenCalled();
	});

	test("authenticates an organization by API key", async () => {
		const response = await app.request("/organizations/authenticate", {
			method: "POST",
			body: JSON.stringify({ apiKey: "sk_live_test" }),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(200);
		expect(organizationService.authenticateWithApiKey).toHaveBeenCalledWith(
			"sk_live_test",
		);
		expect(body.data?.apiKey).toBeUndefined();
	});

	test("returns 401 for invalid API keys", async () => {
		organizationService.authenticateWithApiKey.mockImplementationOnce(
			async () => {
				throw new Error("Invalid API key");
			},
		);

		const response = await app.request("/organizations/authenticate", {
			method: "POST",
			body: JSON.stringify({ apiKey: "sk_live_invalid" }),
			headers: { "content-type": "application/json" },
		});
		const body = await parseBody(response);

		expect(response.status).toBe(401);
		expect(body.error?.code).toBe("INVALID_API_KEY");
	});

	test("deactivates an organization", async () => {
		const response = await app.request(`/organizations/${organizationId}`, {
			method: "DELETE",
		});
		const body = await parseBody(response);

		expect(response.status).toBe(200);
		expect(organizationService.deactivateOrganization).toHaveBeenCalledWith(
			organizationId,
		);
		expect(body.data?.isActive).toBe(false);
	});
});

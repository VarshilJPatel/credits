import { z } from "zod";

export const organizationIdParamSchema = z.object({
	id: z.uuid(),
});

export const createOrganizationRequestSchema = z.object({
	name: z.string().trim().min(1).max(120),
});

export const updateOrganizationRequestSchema = z
	.object({
		name: z.string().trim().min(1).max(120).optional(),
		isActive: z.boolean().optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "At least one field must be provided",
	});

export const authenticateOrganizationRequestSchema = z.object({
	apiKey: z.string().trim().min(1),
});

export type CreateOrganizationRequest = z.infer<
	typeof createOrganizationRequestSchema
>;
export type UpdateOrganizationRequest = z.infer<
	typeof updateOrganizationRequestSchema
>;
export type AuthenticateOrganizationRequest = z.infer<
	typeof authenticateOrganizationRequestSchema
>;

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

export const publicOrganizationSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	isActive: z.boolean(),
	createdAt: z.iso.datetime().or(z.date()),
	updatedAt: z.iso.datetime().or(z.date()),
});

export const createdOrganizationSchema = publicOrganizationSchema.extend({
	apiKey: z.string(),
});

export const createdOrganizationResponseSchema = z.object({
	data: createdOrganizationSchema,
});

export const publicOrganizationResponseSchema = z.object({
	data: publicOrganizationSchema,
});

export const errorResponseSchema = z.object({
	error: z.object({
		code: z.string(),
		message: z.string(),
	}),
});

export const validationErrorResponseSchema = z.object({
	error: z.object({
		code: z.literal("VALIDATION_ERROR"),
		message: z.string(),
		issues: z.array(z.unknown()),
	}),
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

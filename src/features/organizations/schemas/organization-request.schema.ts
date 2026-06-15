import { z } from "@hono/zod-openapi";

export const CreateOrganizationRequestSchema = z
	.object({
		name: z.string().trim().min(1).max(120),
	})
	.openapi("CreateOrganizationRequest");

export const UpdateOrganizationRequestSchema = z
	.object({
		name: z.string().trim().min(1).max(120).optional(),
		isActive: z.boolean().optional(),
	})
	.refine((v) => Object.keys(v).length > 0)
	.openapi("UpdateOrganizationRequest");

import { z } from "@hono/zod-openapi";

export const ErrorSchema = z
	.object({
		code: z.string(),
		message: z.string(),
	})
	.openapi("Error");

export const ValidationErrorSchema = z
	.object({
		code: z.literal("VALIDATION_ERROR"),
		message: z.string(),
		issues: z.array(z.unknown()),
	})
	.openapi("ValidationError");

export const createSuccessResponseSchema = <TSchema extends z.ZodTypeAny>(
	schema: TSchema,
) =>
	z.object({
		data: schema,
	});

export const createListResponseSchema = <TSchema extends z.ZodTypeAny>(
	schema: TSchema,
) =>
	z.object({
		data: z.array(schema),
	});

export const createErrorResponseSchema = () =>
	z.object({
		error: ErrorSchema,
	});

export const createValidationErrorResponseSchema = () =>
	z.object({
		error: ValidationErrorSchema,
	});

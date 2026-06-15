import type { Context } from "hono";
import { AppError } from "@/shared/errors/app-error";

export const handleError = (error: unknown, c: Context) => {
	if (error instanceof AppError) {
		return c.json(
			{
				error: {
					code: error.code,
					message: error.message,
				},
			},
			error.statusCode,
		);
	}

	return c.json(
		{
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: "An unexpected error occurred",
			},
		},
		500,
	);
};

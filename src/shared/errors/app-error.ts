import type { ContentfulStatusCode } from "hono/utils/http-status";

export abstract class AppError extends Error {
	abstract readonly code: string;
	abstract readonly statusCode: ContentfulStatusCode;
}

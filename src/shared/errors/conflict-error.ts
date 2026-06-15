import { AppError } from "./app-error";

export class ConflictError extends AppError {
	readonly code = "CONFLICT";
	readonly statusCode = 409;
}

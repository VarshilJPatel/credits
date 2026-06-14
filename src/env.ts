import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		PORT: z.number(),
		DATABASE_URL: z.url(),
	},

	/*
	 * Specify what values should be validated by your schemas above.
	 */
	runtimeEnv: process.env,
});

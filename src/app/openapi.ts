import { env } from "@/config/env";

export const openApiConfig = {
	openapi: "3.1.0",

	info: {
		title: "UsageCredits API",
		version: "1.0.0",
		description:
			"Infrastructure API for SaaS companies to create organizations, issue API keys, and manage credit-based billing primitives.",
	},

	servers: [
		{
			url: `http://localhost:${env.PORT}`,
			description: "Local development",
		},
	],

	tags: [
		{
			name: "System",
			description: "System endpoints",
		},
		{
			name: "Organizations",
			description: "Tenant organization management and API key authentication",
		},
	],
};

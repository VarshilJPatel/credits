import { boolean, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

export const organizations = pgTable(
	"organizations",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		name: text("name").notNull(),

		apiKey: text("api_key").notNull().unique(),

		isActive: boolean("is_active").notNull().default(true),

		...timestamps,
	},
	(table) => ({
		apiKeyIdx: uniqueIndex("organizations_api_key_idx").on(table.apiKey),
	}),
);

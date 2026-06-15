import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { organizations } from "./organization";

export const webhookEndpoints = pgTable(
	"webhook_endpoints",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		organizationId: uuid("organization_id")
			.references(() => organizations.id, {
				onDelete: "cascade",
			})
			.notNull(),

		url: text("url").notNull(),

		secret: text("secret").notNull(),

		isActive: boolean("is_active").default(true).notNull(),

		...timestamps,
	},
	(table) => ({
		organizationIdx: index("webhooks_organization_idx").on(
			table.organizationId,
		),

		activeIdx: index("webhooks_active_idx").on(table.isActive),
	}),
);

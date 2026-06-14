import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { organizations } from "./organization";

export const accounts = pgTable(
	"accounts",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		organizationId: uuid("organization_id")
			.references(() => organizations.id, {
				onDelete: "cascade",
			})
			.notNull(),

		externalId: text("external_id").notNull(),

		name: text("name"),

		email: text("email"),

		...timestamps,
	},
	(table) => ({
		orgExternalUnique: uniqueIndex("accounts_org_external_idx").on(
			table.organizationId,
			table.externalId,
		),

		organizationIdx: index("accounts_organization_idx").on(
			table.organizationId,
		),

		emailIdx: index("accounts_email_idx").on(table.email),
	}),
);

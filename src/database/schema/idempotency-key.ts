import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { organizations } from "./organization";

export const idempotencyKeys = pgTable(
	"idempotency_keys",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		organizationId: uuid("organization_id")
			.references(() => organizations.id, {
				onDelete: "cascade",
			})
			.notNull(),

		key: text("key").notNull(),

		requestHash: text("request_hash").notNull(),

		responseBody: text("response_body"),

		...timestamps,
	},
	(table) => ({
		uniqueKey: uniqueIndex("idempotency_org_key_idx").on(
			table.organizationId,
			table.key,
		),

		organizationIdx: index("idempotency_org_idx").on(table.organizationId),
	}),
);

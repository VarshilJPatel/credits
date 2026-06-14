import { bigint, index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { accounts } from "./account";
import { timestamps } from "./common";

export const wallets = pgTable(
	"wallets",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		accountId: uuid("account_id")
			.references(() => accounts.id, {
				onDelete: "cascade",
			})
			.notNull(),

		balance: bigint("balance", {
			mode: "number",
		})
			.default(0)
			.notNull(),

		...timestamps,
	},
	(table) => ({
		accountUnique: uniqueIndex("wallets_account_idx").on(table.accountId),

		balanceIdx: index("wallets_balance_idx").on(table.balance),
	}),
);

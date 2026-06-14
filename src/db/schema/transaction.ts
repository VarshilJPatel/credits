import {
	bigint,
	index,
	pgEnum,
	pgTable,
	text,
	uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { wallets } from "./wallet";

export const transactionTypeEnum = pgEnum("transaction_type", [
	"grant",
	"consume",
	"topup",
	"refund",
	"expiry",
	"adjustment",
]);

export const transactions = pgTable(
	"transactions",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		walletId: uuid("wallet_id")
			.references(() => wallets.id, {
				onDelete: "cascade",
			})
			.notNull(),

		amount: bigint("amount", {
			mode: "number",
		}).notNull(),

		type: transactionTypeEnum("type").notNull(),

		event: text("event"),

		reason: text("reason"),

		referenceId: text("reference_id"),

		metadata: text("metadata"),

		...timestamps,
	},
	(table) => ({
		walletIdx: index("transactions_wallet_idx").on(table.walletId),

		walletCreatedIdx: index("transactions_wallet_created_idx").on(
			table.walletId,
			table.createdAt,
		),

		typeIdx: index("transactions_type_idx").on(table.type),

		referenceIdx: index("transactions_reference_idx").on(table.referenceId),
	}),
);

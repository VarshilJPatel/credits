import {
	bigint,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./common";
import { wallets } from "./wallet";

export const creditBuckets = pgTable(
	"credit_buckets",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		walletId: uuid("wallet_id")
			.references(() => wallets.id, {
				onDelete: "cascade",
			})
			.notNull(),

		source: text("source").notNull(),

		totalCredits: bigint("total_credits", {
			mode: "number",
		}).notNull(),

		remainingCredits: bigint("remaining_credits", {
			mode: "number",
		}).notNull(),

		expiresAt: timestamp("expires_at", {
			withTimezone: true,
		}),

		...timestamps,
	},
	(table) => ({
		walletIdx: index("credit_buckets_wallet_idx").on(table.walletId),

		expiryIdx: index("credit_buckets_expiry_idx").on(table.expiresAt),

		walletExpiryIdx: index("credit_buckets_wallet_expiry_idx").on(
			table.walletId,
			table.expiresAt,
		),
	}),
);

import { relations } from "drizzle-orm";
import { accounts } from "./account";
import { creditBuckets } from "./credit-bucket";
import { organizations } from "./organization";
import { transactions } from "./transaction";
import { wallets } from "./wallet";
import { webhookEndpoints } from "./webhook-endpoint";

export const organizationRelations = relations(organizations, ({ many }) => ({
	accounts: many(accounts),
	webhooks: many(webhookEndpoints),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
	organization: one(organizations, {
		fields: [accounts.organizationId],
		references: [organizations.id],
	}),

	wallet: one(wallets),
}));

export const walletRelations = relations(wallets, ({ one, many }) => ({
	account: one(accounts, {
		fields: [wallets.accountId],
		references: [accounts.id],
	}),

	transactions: many(transactions),

	creditBuckets: many(creditBuckets),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
	wallet: one(wallets, {
		fields: [transactions.walletId],
		references: [wallets.id],
	}),
}));

export const creditBucketRelations = relations(creditBuckets, ({ one }) => ({
	wallet: one(wallets, {
		fields: [creditBuckets.walletId],
		references: [wallets.id],
	}),
}));

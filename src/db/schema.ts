import { pgTable, serial, text, numeric, timestamp, integer, date } from 'drizzle-orm/pg-core';

// جدول المحافظ
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // اسم المحفظة
  phoneNumber: text('phone_number').notNull().unique(), // رقم الهاتف
  dailyLimit: numeric('daily_limit', { precision: 10, scale: 2 }).notNull(), // الحد اليومي
  monthlyLimit: numeric('monthly_limit', { precision: 10, scale: 2 }).notNull(), // الحد الشهري
  currentBalance: numeric('current_balance', { precision: 10, scale: 2 }).default('0'), // الرصيد الحالي
  color: text('color').default('#1E40AF'), // لون للتمييز
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول المعاملات
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  type: text('type').notNull(), // 'send' أو 'receive'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  transactionDate: timestamp('transaction_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

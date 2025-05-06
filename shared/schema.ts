import { pgTable, text, serial, integer, timestamp, doublePrecision, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Account types
export const accountTypes = pgTable("account_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  interestRate: doublePrecision("interest_rate").notNull().default(0),
  minimumBalance: doublePrecision("minimum_balance").notNull().default(0),
  monthlyFee: doublePrecision("monthly_fee").notNull().default(0),
  features: jsonb("features").notNull().default([]),
});

export const insertAccountTypeSchema = createInsertSchema(accountTypes).omit({
  id: true,
});

// Accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountTypeId: integer("account_type_id").notNull().references(() => accountTypes.id),
  accountNumber: text("account_number").notNull().unique(),
  balance: doublePrecision("balance").notNull().default(0),
  available: doublePrecision("available").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  maturityDate: timestamp("maturity_date"), // For CDs
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, transfer, payment
  category: text("category"), // groceries, utilities, income, etc.
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  merchantName: text("merchant_name"),
  merchantCategory: text("merchant_category"),
  reference: text("reference"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

// Transfers
export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  fromAccountId: integer("from_account_id").notNull().references(() => accounts.id),
  toAccountId: integer("to_account_id").notNull().references(() => accounts.id),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
});

export const insertTransferSchema = createInsertSchema(transfers).omit({
  id: true,
});

// ACH Transfers
export const achTransfers = pgTable("ach_transfers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  amount: doublePrecision("amount").notNull(),
  routingNumber: text("routing_number").notNull(),
  accountNumber: text("account_number").notNull(),
  accountType: text("account_type").notNull(), // checking, savings
  description: text("description"),
  direction: text("direction").notNull(), // incoming, outgoing
  status: text("status").notNull().default("pending"),
  traceNumber: text("trace_number"),
  batchId: text("batch_id"),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertAchTransferSchema = createInsertSchema(achTransfers).omit({
  id: true,
  date: true,
  traceNumber: true,
  batchId: true,
});

// Banking products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // checking, savings, cd
  interestRate: doublePrecision("interest_rate").notNull().default(0),
  minimumDeposit: doublePrecision("minimum_deposit").notNull().default(0),
  monthlyFee: doublePrecision("monthly_fee").notNull().default(0),
  features: jsonb("features").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // open, in-progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  category: text("category").notNull(), // account, transaction, technical, other
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: true,
});

// Fraud alerts
export const fraudAlerts = pgTable("fraud_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountId: integer("account_id").references(() => accounts.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  alertType: text("alert_type").notNull(), // suspicious_transaction, login_attempt, etc.
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("new"), // new, under_review, resolved, false_positive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AccountType = typeof accountTypes.$inferSelect;
export type InsertAccountType = z.infer<typeof insertAccountTypeSchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;

export type AchTransfer = typeof achTransfers.$inferSelect;
export type InsertAchTransfer = z.infer<typeof insertAchTransferSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;

import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, int, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("homeowner"), // homeowner, officer, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  customerId: varchar("customer_id", { length: 36 }).references(() => users.id), // Optional for guest bookings
  officerId: varchar("officer_id", { length: 36 }).references(() => users.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  hasReceiptsReady: boolean("has_receipts_ready").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
});

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  appointmentId: varchar("appointment_id", { length: 36 }).references(() => appointments.id),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => users.id),
  squarePaymentId: text("square_payment_id"),
  squareSubscriptionId: text("square_subscription_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  service: text("service").notNull(), // audit, title_protection
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"), // card, bank_account
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  processedAt: timestamp("processed_at"),
});

export const auditItems = mysqlTable("audit_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  appointmentId: varchar("appointment_id", { length: 36 }).notNull().references(() => appointments.id),
  category: text("category").notNull(), // electronics, jewelry, furniture, artwork, appliances, other
  description: text("description").notNull(),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  serialNumber: text("serial_number"),
  model: text("model"),
  photoUrl: text("photo_url"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const reports = mysqlTable("reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  appointmentId: varchar("appointment_id", { length: 36 }).notNull().references(() => appointments.id),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => users.id),
  officerId: varchar("officer_id", { length: 36 }).notNull().references(() => users.id),
  reportNumber: text("report_number").notNull().unique(),
  pdfUrl: text("pdf_url"),
  status: text("status").notNull().default("generating"), // generating, completed, failed
  totalItemsDocumented: int("total_items_documented").notNull().default(0),
  totalEstimatedValue: decimal("total_estimated_value", { precision: 12, scale: 2 }),
  customerSignature: text("customer_signature"),
  officerSignature: text("officer_signature"),
  metadata: json("metadata"), // Additional report data
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
});

export const titleMonitoring = mysqlTable("title_monitoring", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => users.id),
  propertyAddress: text("property_address").notNull(),
  subscriptionId: varchar("subscription_id", { length: 36 }),
  isActive: boolean("is_active").notNull().default(true),
  monthlyFee: decimal("monthly_fee", { precision: 5, scale: 2 }).notNull().default("50.00"),
  lastChecked: timestamp("last_checked"),
  alertsCount: int("alerts_count").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const docuSignAgreements = mysqlTable("docusign_agreements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  appointmentId: varchar("appointment_id", { length: 36 }).notNull().references(() => appointments.id),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => users.id),
  envelopeId: text("envelope_id"),
  status: text("status").notNull().default("sent"), // sent, signed, declined, expired
  documentUrl: text("document_url"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  payments: many(payments),
  reports: many(reports),
  titleMonitoring: many(titleMonitoring),
  docuSignAgreements: many(docuSignAgreements),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  customer: one(users, { fields: [appointments.customerId], references: [users.id] }),
  officer: one(users, { fields: [appointments.officerId], references: [users.id] }),
  auditItems: many(auditItems),
  report: one(reports),
  payment: one(payments),
  docuSignAgreement: one(docuSignAgreements),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, { fields: [payments.appointmentId], references: [appointments.id] }),
  customer: one(users, { fields: [payments.customerId], references: [users.id] }),
}));

export const auditItemsRelations = relations(auditItems, ({ one }) => ({
  appointment: one(appointments, { fields: [auditItems.appointmentId], references: [appointments.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  appointment: one(appointments, { fields: [reports.appointmentId], references: [reports.id] }),
  customer: one(users, { fields: [reports.customerId], references: [users.id] }),
  officer: one(users, { fields: [reports.officerId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertAuditItemSchema = createInsertSchema(auditItems).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTitleMonitoringSchema = createInsertSchema(titleMonitoring).omit({
  id: true,
  createdAt: true,
});

export const insertDocuSignAgreementSchema = createInsertSchema(docuSignAgreements).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertAuditItem = z.infer<typeof insertAuditItemSchema>;
export type AuditItem = typeof auditItems.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertTitleMonitoring = z.infer<typeof insertTitleMonitoringSchema>;
export type TitleMonitoring = typeof titleMonitoring.$inferSelect;

export type InsertDocuSignAgreement = z.infer<typeof insertDocuSignAgreementSchema>;
export type DocuSignAgreement = typeof docuSignAgreements.$inferSelect;
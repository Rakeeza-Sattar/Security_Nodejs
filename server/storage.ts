import {
  users, appointments, payments, auditItems, reports, titleMonitoring, docuSignAgreements,
  type User, type InsertUser, type Appointment, type InsertAppointment,
  type Payment, type InsertPayment, type AuditItem, type InsertAuditItem,
  type Report, type InsertReport, type TitleMonitoring, type InsertTitleMonitoring,
  type DocuSignAgreement, type InsertDocuSignAgreement
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

const MemStore = MemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Appointments
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByCustomer(customerId: string): Promise<Appointment[]>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;
  getAppointmentsByOfficer(officerId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: string): Promise<void>;
  assignOfficer(appointmentId: string, officerId: string): Promise<void>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByCustomer(customerId: string): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: string, squarePaymentId?: string): Promise<void>;

  // Audit Items
  createAuditItem(item: InsertAuditItem): Promise<AuditItem>;
  getAuditItemsByAppointment(appointmentId: string): Promise<AuditItem[]>;
  updateAuditItem(id: string, updates: Partial<AuditItem>): Promise<void>;
  deleteAuditItem(id: string): Promise<void>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getReportByAppointment(appointmentId: string): Promise<Report | undefined>;
  updateReportStatus(id: string, status: string, pdfUrl?: string): Promise<void>;

  // Officers
  getOfficers(): Promise<User[]>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    appointmentsToday: number;
    reportsGenerated: number;
    monthlyRevenue: number;
    activeOfficers: number;
  }>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Appointments
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByCustomer(customerId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.customerId, customerId))
      .orderBy(desc(appointments.createdAt));
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.email, email));
  }

  async getAppointmentsByOfficer(officerId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.officerId, officerId))
      .orderBy(desc(appointments.createdAt));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .orderBy(desc(appointments.createdAt));
  }

  async updateAppointmentStatus(id: string, status: string): Promise<void> {
    await db.update(appointments)
      .set({ status, completedAt: status === 'completed' ? new Date() : null })
      .where(eq(appointments.id, id));
  }

  async assignOfficer(appointmentId: string, officerId: string): Promise<void> {
    await db.update(appointments)
      .set({ officerId })
      .where(eq(appointments.id, appointmentId));
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.customerId, customerId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePaymentStatus(id: string, status: string, squarePaymentId?: string): Promise<void> {
    const updates: any = { status, processedAt: new Date() };
    if (squarePaymentId) {
      updates.squarePaymentId = squarePaymentId;
    }
    await db.update(payments)
      .set(updates)
      .where(eq(payments.id, id));
  }

  // Audit Items
  async createAuditItem(item: InsertAuditItem): Promise<AuditItem> {
    const [newItem] = await db
      .insert(auditItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getAuditItemsByAppointment(appointmentId: string): Promise<AuditItem[]> {
    return await db.select().from(auditItems)
      .where(eq(appointmentId, appointmentId))
      .orderBy(desc(auditItems.createdAt));
  }

  async updateAuditItem(id: string, updates: Partial<AuditItem>): Promise<void> {
    await db.update(auditItems)
      .set(updates)
      .where(eq(auditItems.id, id));
  }

  async deleteAuditItem(id: string): Promise<void> {
    await db.delete(auditItems).where(eq(auditItems.id, id));
  }

  // Reports
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getReportByAppointment(appointmentId: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.appointmentId, appointmentId));
    return report || undefined;
  }

  async updateReportStatus(id: string, status: string, pdfUrl?: string): Promise<void> {
    const updates: any = { status };
    if (status === 'completed') {
      updates.completedAt = new Date();
    }
    if (pdfUrl) {
      updates.pdfUrl = pdfUrl;
    }
    await db.update(reports)
      .set(updates)
      .where(eq(reports.id, id));
  }

  // Officers
  async getOfficers(): Promise<User[]> {
    return await db.select().from(users)
      .where(and(eq(users.role, 'officer'), eq(users.isActive, true)));
  }

  // Officers
  async getOfficers(): Promise<any[]> {
    return await db.select().from(users).where(eq(users.role, 'officer'));
  }

  async assignOfficer(appointmentId: string, officerId: string): Promise<void> {
    await db.update(appointments)
      .set({ officerId })
      .where(eq(appointments.id, appointmentId));
  }

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, appointmentId));
  }

  async getAppointment(appointmentId: string): Promise<any> {
    const [appointment] = await db.select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId));
    return appointment;
  }

  async createReport(reportData: any): Promise<any> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    appointmentsToday: number;
    reportsGenerated: number;
    monthlyRevenue: number;
    activeOfficers: number;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [appointmentStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(sql`DATE(created_at) = ${today}`);

    const [reportStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, 'completed'));

    // Fix monthly revenue calculation with proper DECIMAL to number conversion
    const [revenueStats] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0)` })
      .from(payments)
      .where(and(
        eq(payments.status, 'completed'),
        sql`EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
      ));

    const [officerStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.role, 'officer'), eq(users.isActive, true)));

    return {
      appointmentsToday: Number(appointmentStats?.count || 0),
      reportsGenerated: Number(reportStats?.count || 0),
      monthlyRevenue: Number(revenueStats?.total || 0),
      activeOfficers: Number(officerStats?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
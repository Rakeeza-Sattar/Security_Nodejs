import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAppointmentSchema, insertPaymentSchema, insertAuditItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Appointments
  app.post("/api/appointments", async (req, res) => {
    try {
      // For guest bookings, don't include customerId (will be null)
      const appointmentData = req.body;
      
      const validatedData = insertAppointmentSchema.parse(appointmentData);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Appointment creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let appointments;
      if (req.user?.role === 'admin') {
        appointments = await storage.getAllAppointments();
      } else if (req.user?.role === 'officer') {
        appointments = await storage.getAppointmentsByOfficer(req.user.id);
      } else {
        appointments = await storage.getAppointmentsByCustomer(req.user!.id);
      }

      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== 'admin' && req.user?.role !== 'officer')) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { status } = req.body;
      await storage.updateAppointmentStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  app.patch("/api/appointments/:id/assign-officer", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { officerId } = req.body;
      await storage.assignOfficer(req.params.id, officerId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign officer" });
    }
  });

  // Payments
  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);

      // TODO: Integrate with Square Payment API
      // const squareResult = await processSquarePayment(payment);
      // await storage.updatePaymentStatus(payment.id, squareResult.status, squareResult.paymentId);

      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payments = await storage.getPaymentsByCustomer(req.user!.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Audit Items
  app.post("/api/audit-items", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'officer') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const validatedData = insertAuditItemSchema.parse(req.body);
      const item = await storage.createAuditItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid data" });
    }
  });

  app.get("/api/audit-items/:appointmentId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const items = await storage.getAuditItemsByAppointment(req.params.appointmentId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit items" });
    }
  });

  app.patch("/api/audit-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'officer') {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.updateAuditItem(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update audit item" });
    }
  });

  app.delete("/api/audit-items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'officer') {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteAuditItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audit item" });
    }
  });

  // Officers
  app.get("/api/officers", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const officers = await storage.getOfficers();
      res.json(officers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch officers" });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Generate Report
  app.post("/api/reports/generate/:appointmentId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'officer') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const appointment = await storage.getAppointment(req.params.appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const reportNumber = `RPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      if (!appointment.customerId) {
        return res.status(400).json({ message: "Appointment does not have a valid customerId" });
      }

      const report = await storage.createReport({
        appointmentId: req.params.appointmentId,
        customerId: appointment.customerId,
        officerId: req.user!.id,
        reportNumber,
        status: 'generating',
        totalItemsDocumented: 0,
      });

      // TODO: Generate PDF report
      // const pdfUrl = await generatePDFReport(report);
      // await storage.updateReportStatus(report.id, 'completed', pdfUrl);

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

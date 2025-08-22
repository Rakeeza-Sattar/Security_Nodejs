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
      
      // Send confirmation email
      try {
        const { emailService } = await import("./email-service");
        await emailService.sendAppointmentConfirmation({
          customerName: appointment.fullName,
          email: appointment.email,
          appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          appointmentTime: appointment.preferredTime,
          address: appointment.address,
          phone: appointment.phone || undefined,
          appointmentId: appointment.id,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the appointment creation if email fails
      }
      
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

  // Square subscription creation
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const { customerId, planId, idempotencyKey } = req.body;
      
      if (!customerId || !planId || !idempotencyKey) {
        return res.status(400).json({ message: "Missing required subscription fields" });
      }

      // Import Square service
      const { squareService } = await import("./square-service");

      // Create subscription with Square
      const squareResult = await squareService.createSubscription({
        customerId,
        planId,
        idempotencyKey,
        locationId: process.env.SQUARE_LOCATION_ID!,
        startDate: new Date().toISOString().split('T')[0]
      });

      if (!squareResult.success) {
        return res.status(400).json({ message: squareResult.error });
      }

      res.status(201).json({ subscription: squareResult.subscription });
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Subscription creation failed" });
    }
  });

  // Payments
  app.post("/api/payments", async (req, res) => {
    try {
      const { sourceId, amount, currency = 'USD', appointmentId, customerId, idempotencyKey } = req.body;
      
      if (!sourceId || !amount || !appointmentId || !idempotencyKey) {
        return res.status(400).json({ message: "Missing required payment fields" });
      }

      // Import Square service
      const { squareService } = await import("./square-service");

      // Process payment with Square
      const squareResult = await squareService.createPayment({
        sourceId,
        amountMoney: {
          amount: amount * 100, // Convert to cents
          currency
        },
        idempotencyKey,
        locationId: process.env.SQUARE_LOCATION_ID!,
        customerId
      });

      if (!squareResult.success) {
        return res.status(400).json({ message: squareResult.error });
      }

      // Create payment record in database
      const paymentData = {
        appointmentId,
        customerId,
        amount: amount.toString(),
        currency,
        service: 'title_protection',
        status: 'completed',
        squarePaymentId: squareResult.paymentId,
        metadata: { squarePayment: squareResult.payment }
      };

      const payment = await storage.createPayment(paymentData);
      res.status(201).json({ payment, squareResult: squareResult.payment });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Payment processing failed" });
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

  // DocuSign Integration
  app.post("/api/docusign/send-agreement", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Import DocuSign service
      const { docuSignService } = await import("./docusign-service");

      const result = await docuSignService.createServiceAgreementEnvelope({
        customerName: appointment.fullName,
        customerEmail: appointment.email,
        appointmentId: appointment.id,
        appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        appointmentTime: appointment.preferredTime,
        address: appointment.address,
        serviceType: 'Home Security Audit',
        amount: 0, // Base service is free
      });

      if (result.success) {
        // Send DocuSign agreement email
        try {
          const { emailService } = await import("./email-service");
          await emailService.sendDocuSignAgreementEmail({
            customerName: appointment.fullName,
            email: appointment.email,
            appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US'),
            appointmentTime: appointment.preferredTime,
            address: appointment.address,
            appointmentId: appointment.id,
          }, result.signingUrl || '');
        } catch (emailError) {
          console.error('Failed to send DocuSign agreement email:', emailError);
        }

        res.json({
          success: true,
          envelopeId: result.envelopeId,
          signingUrl: result.signingUrl,
        });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error('DocuSign agreement creation error:', error);
      res.status(500).json({ message: "Failed to create service agreement" });
    }
  });

  app.get("/api/docusign/status/:envelopeId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { docuSignService } = await import("./docusign-service");
      const status = await docuSignService.checkEnvelopeStatus(req.params.envelopeId);
      
      res.json(status);
    } catch (error) {
      console.error('DocuSign status check error:', error);
      res.status(500).json({ message: "Failed to check document status" });
    }
  });

  app.get("/api/docusign/download/:envelopeId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { docuSignService } = await import("./docusign-service");
      const result = await docuSignService.downloadCompletedDocument(req.params.envelopeId);
      
      if (result.success) {
        res.json({ documentBase64: result.documentBase64 });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error('DocuSign download error:', error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Title Monitoring Routes
  app.post("/api/title-monitoring/subscribe", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { propertyAddress, alertEmail, frequency, squareSubscriptionId } = req.body;
      
      if (!propertyAddress || !alertEmail || !frequency) {
        return res.status(400).json({ message: "Property address, email, and frequency are required" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      
      const result = await titleMonitoringService.createSubscription({
        customerId: req.user!.id,
        propertyAddress,
        alertEmail,
        frequency,
        squareSubscriptionId,
      });

      if (result.success) {
        res.status(201).json(result.subscription);
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error('Title monitoring subscription error:', error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get("/api/title-monitoring/subscriptions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      
      let subscriptions;
      if (req.user?.role === 'admin') {
        subscriptions = await titleMonitoringService.getAllSubscriptions();
      } else {
        subscriptions = await titleMonitoringService.getCustomerSubscriptions(req.user!.id);
      }

      res.json(subscriptions);
    } catch (error) {
      console.error('Title monitoring subscriptions fetch error:', error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/title-monitoring/:subscriptionId/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      
      const result = await titleMonitoringService.cancelSubscription(req.params.subscriptionId);
      
      if (result.success) {
        res.json({ message: "Subscription cancelled successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error('Title monitoring cancellation error:', error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  app.get("/api/title-monitoring/:subscriptionId/alerts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      const alerts = await titleMonitoringService.getAlerts(req.params.subscriptionId);
      
      res.json(alerts);
    } catch (error) {
      console.error('Title monitoring alerts fetch error:', error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/title-monitoring/:subscriptionId/alerts/:alertId/resolve", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      const success = await titleMonitoringService.markAlertResolved(
        req.params.subscriptionId,
        req.params.alertId
      );
      
      if (success) {
        res.json({ message: "Alert marked as resolved" });
      } else {
        res.status(404).json({ message: "Alert not found" });
      }
    } catch (error) {
      console.error('Title monitoring alert resolution error:', error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  app.get("/api/title-monitoring/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { titleMonitoringService } = await import("./title-monitoring-service");
      const stats = await titleMonitoringService.getSubscriptionStats();
      
      res.json(stats);
    } catch (error) {
      console.error('Title monitoring stats error:', error);
      res.status(500).json({ message: "Failed to fetch stats" });
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

      // Generate PDF report
      const { pdfService } = await import("./pdf-service");
      const pdfResult = await pdfService.generateAuditReport(req.params.appointmentId);
      
      if (pdfResult.success && pdfResult.pdfBuffer) {
        // In a real implementation, you would upload the PDF to cloud storage
        // For now, we'll store it temporarily and provide a download endpoint
        const pdfBase64 = pdfResult.pdfBuffer.toString('base64');
        
        // Update report status to completed
        // await storage.updateReportStatus(report.id, 'completed', 'generated');
        
        // Store PDF data temporarily (in production, use cloud storage)
        // This is a simplified approach - in real apps use AWS S3, Google Cloud Storage, etc.
        const reportData = {
          ...report,
          pdfData: pdfBase64,
          status: 'completed'
        };
        
        res.status(201).json(reportData);
      } else {
        res.status(500).json({ message: pdfResult.error || "PDF generation failed" });
        return;
      }

      // Send report delivery email when completed
      try {
        const { emailService } = await import("./email-service");
        // This would be called when the PDF is actually generated
        // await emailService.sendReportDeliveryEmail({
        //   customerName: appointment.fullName,
        //   email: appointment.email,
        //   appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US'),
        //   appointmentTime: appointment.preferredTime,
        //   address: appointment.address,
        //   appointmentId: appointment.id,
        // }, pdfUrl);
      } catch (emailError) {
        console.error('Failed to send report delivery email:', emailError);
      }

      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

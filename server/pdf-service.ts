import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import { storage } from './storage';

interface ReportData {
  appointmentId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
  officerId: string;
  officerName: string;
  reportNumber: string;
  items: AuditItem[];
  totalValue: number;
  generatedAt: string;
}

interface AuditItem {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedValue: number;
  receiptProvided: boolean;
  photoPath?: string;
  receiptPhotoPath?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  notes?: string;
}

class PDFService {
  async generateAuditReport(appointmentId: string): Promise<{ success: boolean; pdfBuffer?: Buffer; error?: string }> {
    try {
      // Get appointment and related data
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      const auditItems = await storage.getAuditItemsByAppointment(appointmentId);
      // Get officer info - simplified since we don't have getUser method
      const officer = null; // Would need to implement getUser in storage

      const reportData: ReportData = {
        appointmentId,
        customerId: appointment.customerId || '',
        customerName: appointment.fullName,
        customerEmail: appointment.email,
        address: appointment.address,
        appointmentDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointmentTime: appointment.preferredTime,
        officerId: appointment.officerId || '',
        officerName: 'Licensed Security Officer',
        reportNumber: `RPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        items: auditItems.map(item => ({
          id: item.id,
          name: item.description, // Using description as name since name field doesn't exist
          description: item.description || '',
          category: item.category,
          estimatedValue: parseFloat(item.estimatedValue || '0'),
          receiptProvided: item.receiptUrl ? true : false, // Based on receipt URL presence
          photoPath: item.photoUrl || undefined,
          receiptPhotoPath: item.receiptUrl || undefined,
          serialNumber: item.serialNumber || undefined,
          brand: 'N/A', // Brand field doesn't exist in schema
          model: item.model || undefined,
          purchaseDate: undefined, // Purchase date field doesn't exist
          notes: item.notes || undefined,
        })),
        totalValue: auditItems.reduce((sum, item) => sum + parseFloat(item.estimatedValue || '0'), 0),
        generatedAt: new Date().toISOString(),
      };

      const pdfBuffer = await this.createPDFDocument(reportData);
      return { success: true, pdfBuffer };
    } catch (error: any) {
      console.error('PDF generation error:', error);
      return { success: false, error: error.message || 'PDF generation failed' };
    }
  }

  private async createPDFDocument(data: ReportData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    const { width, height } = page.getSize();

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50;
    const margin = 50;
    const contentWidth = width - 2 * margin;

    // Header Section
    yPosition = this.drawHeader(page, boldFont, regularFont, data, yPosition, margin, contentWidth);

    // Customer Information Section
    yPosition = this.drawCustomerInfo(page, boldFont, regularFont, data, yPosition, margin);

    // Officer Information Section
    yPosition = this.drawOfficerInfo(page, boldFont, regularFont, data, yPosition, margin);

    // Summary Section
    yPosition = this.drawSummary(page, boldFont, regularFont, data, yPosition, margin);

    // Items Section
    yPosition = this.drawItemsTable(page, boldFont, regularFont, data, yPosition, margin, contentWidth);

    // Footer Section
    this.drawFooter(page, regularFont, data, margin);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private drawHeader(page: any, boldFont: any, regularFont: any, data: ReportData, yPosition: number, margin: number, contentWidth: number): number {
    // Company Logo/Title
    page.drawText('🛡️ SecureHome Audit', {
      x: margin,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0.12, 0.23, 0.54), // Blue color
    });

    yPosition -= 30;

    page.drawText('Professional Home Security Documentation Report', {
      x: margin,
      y: yPosition,
      size: 14,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 40;

    // Report Information Box
    const boxHeight = 80;
    page.drawRectangle({
      x: margin,
      y: yPosition - boxHeight,
      width: contentWidth,
      height: boxHeight,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98),
    });

    // Report Details
    page.drawText(`Report Number: ${data.reportNumber}`, {
      x: margin + 10,
      y: yPosition - 20,
      size: 12,
      font: boldFont,
    });

    page.drawText(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, {
      x: margin + 10,
      y: yPosition - 40,
      size: 10,
      font: regularFont,
    });

    page.drawText(`Appointment Date: ${data.appointmentDate} at ${data.appointmentTime}`, {
      x: margin + 10,
      y: yPosition - 60,
      size: 10,
      font: regularFont,
    });

    return yPosition - boxHeight - 20;
  }

  private drawCustomerInfo(page: any, boldFont: any, regularFont: any, data: ReportData, yPosition: number, margin: number): number {
    page.drawText('Customer Information', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 25;

    const customerInfo = [
      `Name: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      `Property Address: ${data.address}`,
      `Customer ID: ${data.customerId}`,
    ];

    customerInfo.forEach((info) => {
      page.drawText(info, {
        x: margin,
        y: yPosition,
        size: 10,
        font: regularFont,
      });
      yPosition -= 15;
    });

    return yPosition - 10;
  }

  private drawOfficerInfo(page: any, boldFont: any, regularFont: any, data: ReportData, yPosition: number, margin: number): number {
    page.drawText('Security Officer Information', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 25;

    const officerInfo = [
      `Officer Name: ${data.officerName}`,
      `Officer ID: ${data.officerId}`,
      `Certification: Licensed Security Professional`,
      `Audit Date: ${data.appointmentDate}`,
    ];

    officerInfo.forEach((info) => {
      page.drawText(info, {
        x: margin,
        y: yPosition,
        size: 10,
        font: regularFont,
      });
      yPosition -= 15;
    });

    return yPosition - 10;
  }

  private drawSummary(page: any, boldFont: any, regularFont: any, data: ReportData, yPosition: number, margin: number): number {
    page.drawText('Audit Summary', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 25;

    const summaryInfo = [
      `Total Items Documented: ${data.items.length}`,
      `Total Estimated Value: $${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `Items with Receipts: ${data.items.filter(item => item.receiptProvided).length}`,
      `Items with Photos: ${data.items.filter(item => item.photoPath).length}`,
    ];

    summaryInfo.forEach((info) => {
      page.drawText(info, {
        x: margin,
        y: yPosition,
        size: 10,
        font: regularFont,
      });
      yPosition -= 15;
    });

    return yPosition - 20;
  }

  private drawItemsTable(page: any, boldFont: any, regularFont: any, data: ReportData, yPosition: number, margin: number, contentWidth: number): number {
    page.drawText('Documented Items', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
    });

    yPosition -= 30;

    // Table headers
    const headers = ['Item Name', 'Category', 'Value', 'Receipt', 'Serial #'];
    const columnWidths = [150, 100, 80, 60, 120];
    let xPosition = margin;

    // Draw header row
    page.drawRectangle({
      x: margin,
      y: yPosition - 20,
      width: contentWidth,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 1,
    });

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition + 5,
        y: yPosition - 15,
        size: 9,
        font: boldFont,
      });
      xPosition += columnWidths[index];
    });

    yPosition -= 25;

    // Draw data rows
    data.items.forEach((item, index) => {
      if (yPosition < 100) {
        // Add new page if needed
        const newPage = page.doc.addPage([612, 792]);
        page = newPage;
        yPosition = 750;
      }

      xPosition = margin;
      const rowData = [
        item.name.substring(0, 20) + (item.name.length > 20 ? '...' : ''),
        item.category,
        `$${item.estimatedValue.toFixed(2)}`,
        item.receiptProvided ? 'Yes' : 'No',
        item.serialNumber || 'N/A',
      ];

      // Alternate row colors
      if (index % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: yPosition - 15,
          width: contentWidth,
          height: 15,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      rowData.forEach((data, colIndex) => {
        page.drawText(data, {
          x: xPosition + 5,
          y: yPosition - 12,
          size: 8,
          font: regularFont,
        });
        xPosition += columnWidths[colIndex];
      });

      yPosition -= 18;
    });

    return yPosition - 20;
  }

  private drawFooter(page: any, regularFont: any, data: ReportData, margin: number): void {
    const footerY = 50;
    
    page.drawText('This report was generated by SecureHome Audit professional services.', {
      x: margin,
      y: footerY + 30,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('For insurance claims and verification: support@securehomeaudit.com | (555) 123-SECURE', {
      x: margin,
      y: footerY + 15,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText(`Report ID: ${data.reportNumber} | Generated: ${new Date(data.generatedAt).toLocaleDateString()}`, {
      x: margin,
      y: footerY,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
}

export const pdfService = new PDFService();
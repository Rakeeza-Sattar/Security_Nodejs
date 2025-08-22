import nodemailer from 'nodemailer';
import { User, Appointment } from '@shared/schema';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface AppointmentEmailData {
  customerName: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  address: string;
  phone?: string;
  appointmentId: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendAppointmentConfirmation(data: AppointmentEmailData): Promise<boolean> {
    try {
      const template = this.generateConfirmationTemplate(data);
      
      const mailOptions = {
        from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }

  async send24HourReminder(data: AppointmentEmailData): Promise<boolean> {
    try {
      const template = this.generate24HourReminderTemplate(data);
      
      const mailOptions = {
        from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('24-hour reminder email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending 24-hour reminder email:', error);
      return false;
    }
  }

  async sendDocuSignAgreementEmail(data: AppointmentEmailData, docuSignUrl: string): Promise<boolean> {
    try {
      const template = this.generateDocuSignTemplate(data, docuSignUrl);
      
      const mailOptions = {
        from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('DocuSign agreement email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending DocuSign agreement email:', error);
      return false;
    }
  }

  async sendReportDeliveryEmail(data: AppointmentEmailData, reportUrl: string): Promise<boolean> {
    try {
      const template = this.generateReportDeliveryTemplate(data, reportUrl);
      
      const mailOptions = {
        from: `"SecureHome Audit" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Report delivery email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending report delivery email:', error);
      return false;
    }
  }

  private generateConfirmationTemplate(data: AppointmentEmailData): EmailTemplate {
    const subject = 'Your Free Home Audit is Scheduled — Please Prepare Your Valuables';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmation</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .checklist { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .checklist-item { display: flex; align-items: flex-start; margin: 10px 0; }
        .check { color: #10b981; margin-right: 10px; font-weight: bold; }
        .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ SecureHome Audit</h1>
          <h2>Appointment Confirmed!</h2>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for choosing SecureHome Audit! Your free home security audit has been successfully scheduled.</p>
          
          <div class="details-box">
            <h3>📅 Appointment Details</h3>
            <p><strong>Date:</strong> ${data.appointmentDate}</p>
            <p><strong>Time:</strong> ${data.appointmentTime}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
          </div>

          <div class="checklist">
            <h3>✅ Please Prepare the Following:</h3>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Gather receipts for valuables (electronics, jewelry, furniture, artwork, etc.)</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Collect items to photograph and document</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Warranty papers and appraisals for high-value items</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Officer will arrive in uniform and show proper identification</span>
            </div>
          </div>

          <h3>📋 What Happens Next?</h3>
          <ol>
            <li><strong>Service Agreement:</strong> You'll receive a DocuSign email to complete the service agreement</li>
            <li><strong>24-Hour Reminder:</strong> We'll send you a reminder email with officer details</li>
            <li><strong>Officer Visit:</strong> Professional documentation of your valuables and receipt verification</li>
            <li><strong>PDF Report:</strong> Receive your comprehensive documentation report via email</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:555-123-SECURE" class="btn">📞 Call Support: (555) 123-SECURE</a>
          </div>

          <p><strong>Need to make changes?</strong> Contact us at (555) 123-SECURE or reply to this email.</p>
        </div>
        <div class="footer">
          <p>SecureHome Audit - Professional Home Security Documentation</p>
          <p>Available 24/7 for support | support@securehomeaudit.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
SecureHome Audit - Appointment Confirmation

Dear ${data.customerName},

Your free home security audit has been scheduled:

Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Address: ${data.address}
Appointment ID: ${data.appointmentId}

Please prepare:
- Gather receipts for valuables (electronics, jewelry, furniture, artwork, etc.)
- Collect items to photograph and document
- Warranty papers and appraisals for high-value items
- Officer will arrive in uniform and show proper identification

What happens next:
1. Service Agreement: You'll receive a DocuSign email
2. 24-Hour Reminder: We'll send you a reminder with officer details
3. Officer Visit: Professional documentation of your valuables
4. PDF Report: Receive your comprehensive report via email

Need to make changes? Contact us at (555) 123-SECURE

SecureHome Audit
Available 24/7 for support
support@securehomeaudit.com
    `;

    return { subject, html, text };
  }

  private generate24HourReminderTemplate(data: AppointmentEmailData): EmailTemplate {
    const subject = 'Reminder: Your Home Audit is Tomorrow — Please Prepare Your Valuables';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>24-Hour Reminder</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .reminder-box { background: #fee2e2; border: 2px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .checklist { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .checklist-item { display: flex; align-items: flex-start; margin: 10px 0; }
        .check { color: #10b981; margin-right: 10px; font-weight: bold; }
        .btn { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ SecureHome Audit</h1>
          <h2>⏰ Reminder: Your Audit is Tomorrow!</h2>
        </div>
        <div class="content">
          <div class="reminder-box">
            <h3>🚨 Your appointment is scheduled for tomorrow:</h3>
            <p><strong>Date:</strong> ${data.appointmentDate}</p>
            <p><strong>Time:</strong> ${data.appointmentTime}</p>
            <p><strong>Address:</strong> ${data.address}</p>
          </div>

          <p>Hello ${data.customerName},</p>
          <p>This is a friendly reminder that your SecureHome Audit is scheduled for tomorrow. Our licensed security officer will arrive at the scheduled time to document your valuables.</p>

          <div class="checklist">
            <h3>✅ Final Preparation Checklist:</h3>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Have all receipts organized and ready</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Gather all valuable items in accessible locations</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Ensure warranty papers and appraisals are available</span>
            </div>
            <div class="checklist-item">
              <span class="check">✓</span>
              <span>Be ready to provide access to all areas being audited</span>
            </div>
          </div>

          <h3>👮‍♂️ About Your Officer</h3>
          <p>Your security officer will:</p>
          <ul>
            <li>Arrive in uniform with proper identification</li>
            <li>Show you their credentials before beginning</li>
            <li>Professional document all items with photos</li>
            <li>Provide you with a comprehensive PDF report</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="tel:555-123-SECURE" class="btn">📞 Need to Reschedule? Call Now</a>
          </div>

          <p><strong>Questions or concerns?</strong> Contact us at (555) 123-SECURE</p>
        </div>
        <div class="footer">
          <p>SecureHome Audit - Professional Home Security Documentation</p>
          <p>Available 24/7 for support</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
SecureHome Audit - 24-Hour Reminder

Hello ${data.customerName},

Your SecureHome Audit is scheduled for TOMORROW:

Date: ${data.appointmentDate}
Time: ${data.appointmentTime}
Address: ${data.address}

Final preparation checklist:
- Have all receipts organized and ready
- Gather all valuable items in accessible locations
- Ensure warranty papers and appraisals are available
- Be ready to provide access to all areas being audited

Your security officer will:
- Arrive in uniform with proper identification
- Show you their credentials before beginning
- Professional document all items with photos
- Provide you with a comprehensive PDF report

Questions or need to reschedule? Call (555) 123-SECURE

SecureHome Audit
Available 24/7 for support
    `;

    return { subject, html, text };
  }

  private generateDocuSignTemplate(data: AppointmentEmailData, docuSignUrl: string): EmailTemplate {
    const subject = 'Please Sign Your Service Agreement - SecureHome Audit';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Agreement Signature Required</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .docusign-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #7c3aed; }
        .btn { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ SecureHome Audit</h1>
          <h2>📝 Digital Signature Required</h2>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for booking your home security audit! Before we can proceed with your appointment, we need you to digitally sign our service agreement.</p>
          
          <div class="docusign-box">
            <h3>📋 Service Agreement Details:</h3>
            <ul>
              <li>Scope of service and item documentation limits</li>
              <li>Liability terms and insurance coverage</li>
              <li>Consent for officer to document items and take photos</li>
              <li>Billing terms and payment schedules</li>
              <li>Privacy and data protection policies</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${docuSignUrl}" class="btn">📝 Sign Agreement Now</a>
            </div>
            
            <p><strong>Appointment Details:</strong></p>
            <p>Date: ${data.appointmentDate} at ${data.appointmentTime}</p>
            <p>Address: ${data.address}</p>
          </div>

          <p><strong>Important:</strong> Please complete the signature within 24 hours to ensure your appointment remains confirmed.</p>
          
          <p>If you have any questions about the agreement terms, please contact us at (555) 123-SECURE before signing.</p>
        </div>
        <div class="footer">
          <p>SecureHome Audit - Professional Home Security Documentation</p>
          <p>Powered by DocuSign Digital Signatures</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
SecureHome Audit - Service Agreement Signature Required

Dear ${data.customerName},

Please digitally sign our service agreement to confirm your appointment.

Appointment Details:
Date: ${data.appointmentDate} at ${data.appointmentTime}
Address: ${data.address}

Sign your agreement here: ${docuSignUrl}

The agreement covers:
- Scope of service and item documentation limits
- Liability terms and insurance coverage
- Consent for officer to document items and take photos
- Billing terms and payment schedules
- Privacy and data protection policies

Please complete within 24 hours to keep your appointment confirmed.

Questions? Call (555) 123-SECURE

SecureHome Audit
Powered by DocuSign Digital Signatures
    `;

    return { subject, html, text };
  }

  private generateReportDeliveryTemplate(data: AppointmentEmailData, reportUrl: string): EmailTemplate {
    const subject = 'Your Home Security Audit Report is Ready';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Audit Report Delivery</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .report-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
        .btn { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: bold; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ SecureHome Audit</h1>
          <h2>✅ Your Report is Ready!</h2>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Great news! Your comprehensive home security audit report has been completed and is ready for download.</p>
          
          <div class="report-box">
            <h3>📊 Your Report Includes:</h3>
            <ul>
              <li>Complete inventory of documented items</li>
              <li>High-quality photos of all valuables</li>
              <li>Receipt verification and documentation</li>
              <li>Professional officer signatures</li>
              <li>Timestamp and report ID for insurance purposes</li>
              <li>Secure evidence package for claims</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" class="btn">📥 Download Your Report</a>
            </div>
          </div>

          <h3>💼 For Insurance Claims:</h3>
          <p>This report is professionally formatted and accepted by major insurance companies. Keep multiple copies in secure locations.</p>

          <h3>🔒 Security Notice:</h3>
          <p>Your report download link will expire in 30 days for security purposes. Please download and save your report immediately.</p>
          
          <p><strong>Need additional copies or have questions?</strong> Contact us at (555) 123-SECURE</p>
          
          <p>Thank you for choosing SecureHome Audit for your home security documentation needs!</p>
        </div>
        <div class="footer">
          <p>SecureHome Audit - Professional Home Security Documentation</p>
          <p>Your trusted partner in asset protection</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
SecureHome Audit - Your Report is Ready!

Dear ${data.customerName},

Your comprehensive home security audit report is ready for download.

Download your report: ${reportUrl}

Your report includes:
- Complete inventory of documented items
- High-quality photos of all valuables
- Receipt verification and documentation
- Professional officer signatures
- Timestamp and report ID for insurance purposes
- Secure evidence package for claims

For Insurance Claims:
This report is professionally formatted and accepted by major insurance companies.

Security Notice:
Your download link expires in 30 days. Please download immediately.

Need additional copies? Call (555) 123-SECURE

Thank you for choosing SecureHome Audit!
    `;

    return { subject, html, text };
  }
}

export const emailService = new EmailService();
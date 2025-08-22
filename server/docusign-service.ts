// @ts-ignore - docusign-esign types not available
import { ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Tabs, Recipients } from 'docusign-esign';

interface DocuSignConfig {
  integrationKey: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
  accountId: string;
}

interface SignatureRequest {
  customerName: string;
  customerEmail: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  address: string;
  serviceType: string;
  amount?: number;
}

class DocuSignService {
  private apiClient: ApiClient;
  private config: DocuSignConfig;

  constructor() {
    this.config = {
      integrationKey: process.env.DOCUSIGN_INTEGRATION_KEY!,
      clientSecret: process.env.DOCUSIGN_CLIENT_SECRET!,
      redirectUri: process.env.DOCUSIGN_REDIRECT_URI || 'http://localhost:5000/api/docusign/callback',
      baseUrl: process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi',
      accountId: process.env.DOCUSIGN_ACCOUNT_ID!,
    };

    this.apiClient = new ApiClient();
    this.apiClient.setBasePath(this.config.baseUrl);
  }

  async authenticate() {
    try {
      // Use JWT authentication for server-to-server integration
      const jwtToken = await this.getJWTToken();
      this.apiClient.addDefaultHeader('Authorization', `Bearer ${jwtToken}`);
      return true;
    } catch (error) {
      console.error('DocuSign authentication failed:', error);
      return false;
    }
  }

  async createServiceAgreementEnvelope(request: SignatureRequest): Promise<{ success: boolean; envelopeId?: string; signingUrl?: string; error?: string }> {
    try {
      await this.authenticate();

      const envelopesApi = new EnvelopesApi(this.apiClient);

      // Create the service agreement document
      const documentContent = this.generateServiceAgreementHTML(request);
      const documentBase64 = Buffer.from(documentContent).toString('base64');

      const document: Document = {
        documentBase64: documentBase64,
        name: `SecureHome Audit Service Agreement - ${request.appointmentId}`,
        fileExtension: 'html',
        documentId: '1',
      };

      // Define signature tabs
      const signHereTab: SignHere = {
        documentId: '1',
        pageNumber: '1',
        recipientId: '1',
        tabLabel: 'CustomerSignature',
        xPosition: '400',
        yPosition: '650',
      };

      const tabs: Tabs = {
        signHereTabs: [signHereTab],
      };

      // Define the signer
      const signer: Signer = {
        email: request.customerEmail,
        name: request.customerName,
        recipientId: '1',
        routingOrder: '1',
        tabs: tabs,
      };

      const recipients: Recipients = {
        signers: [signer],
      };

      const envelopeDefinition: EnvelopeDefinition = {
        emailSubject: 'SecureHome Audit Service Agreement - Please Sign',
        documents: [document],
        recipients: recipients,
        status: 'sent',
      };

      const result = await envelopesApi.createEnvelope(this.config.accountId, {
        envelopeDefinition: envelopeDefinition,
      });

      if (result && result.envelopeId) {
        // Get the signing URL
        const recipientView = await envelopesApi.createRecipientView(this.config.accountId, result.envelopeId, {
          recipientViewRequest: {
            authenticationMethod: 'email',
            email: request.customerEmail,
            recipientId: '1',
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/docusign/complete`,
            userName: request.customerName,
          },
        });

        return {
          success: true,
          envelopeId: result.envelopeId,
          signingUrl: recipientView.url || undefined,
        };
      }

      return {
        success: false,
        error: 'Failed to create envelope',
      };
    } catch (error: any) {
      console.error('DocuSign envelope creation failed:', error);
      return {
        success: false,
        error: error.message || 'Envelope creation failed',
      };
    }
  }

  async checkEnvelopeStatus(envelopeId: string): Promise<{ status: string; completed: boolean }> {
    try {
      await this.authenticate();
      const envelopesApi = new EnvelopesApi(this.apiClient);
      
      const envelope = await envelopesApi.getEnvelope(this.config.accountId, envelopeId);
      
      return {
        status: envelope.status || 'unknown',
        completed: envelope.status === 'completed',
      };
    } catch (error) {
      console.error('Failed to check envelope status:', error);
      return {
        status: 'error',
        completed: false,
      };
    }
  }

  async downloadCompletedDocument(envelopeId: string): Promise<{ success: boolean; documentBase64?: string; error?: string }> {
    try {
      await this.authenticate();
      const envelopesApi = new EnvelopesApi(this.apiClient);
      
      const document = await envelopesApi.getDocument(this.config.accountId, envelopeId, 'combined');
      
      return {
        success: true,
        documentBase64: document.toString('base64'),
      };
    } catch (error: any) {
      console.error('Failed to download document:', error);
      return {
        success: false,
        error: error.message || 'Document download failed',
      };
    }
  }

  private async getJWTToken(): Promise<string> {
    // In a real implementation, you would implement JWT token generation
    // For now, we'll use a placeholder - this needs proper JWT implementation
    // using the DocuSign SDK's JWT helper methods
    
    // This is a simplified version - in production you would:
    // 1. Generate a JWT token with your integration key
    // 2. Sign it with your private key
    // 3. Request an access token from DocuSign
    
    throw new Error('JWT token generation not implemented - requires proper DocuSign JWT setup');
  }

  private generateServiceAgreementHTML(request: SignatureRequest): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>SecureHome Audit Service Agreement</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .signature-block { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; }
            h1 { color: #1e3a8a; }
            h2 { color: #374151; margin-top: 30px; }
            .highlight { background-color: #fef3c7; padding: 2px 4px; }
            .agreement-details { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🛡️ SecureHome Audit Service Agreement</h1>
            <p><strong>Professional Home Security Documentation Services</strong></p>
        </div>

        <div class="agreement-details">
            <h3>Service Details</h3>
            <p><strong>Customer:</strong> ${request.customerName}</p>
            <p><strong>Email:</strong> ${request.customerEmail}</p>
            <p><strong>Appointment ID:</strong> ${request.appointmentId}</p>
            <p><strong>Service Date:</strong> ${request.appointmentDate} at ${request.appointmentTime}</p>
            <p><strong>Property Address:</strong> ${request.address}</p>
            <p><strong>Service Type:</strong> ${request.serviceType}</p>
            ${request.amount ? `<p><strong>Service Fee:</strong> $${request.amount}</p>` : ''}
        </div>

        <div class="section">
            <h2>1. Scope of Services</h2>
            <p>SecureHome Audit agrees to provide professional home security documentation services, including:</p>
            <ul>
                <li>Professional documentation of personal property and valuables</li>
                <li>Digital photography of items for insurance purposes</li>
                <li>Receipt verification and documentation</li>
                <li>Comprehensive PDF report generation</li>
                <li>Professional officer visit with proper identification</li>
            </ul>
        </div>

        <div class="section">
            <h2>2. Customer Responsibilities</h2>
            <p>The Customer agrees to:</p>
            <ul>
                <li>Provide access to all areas requiring documentation</li>
                <li>Have receipts and documentation ready for verification</li>
                <li>Ensure items are accessible for photography</li>
                <li>Be present during the entire documentation process</li>
                <li>Verify officer identification before allowing entry</li>
            </ul>
        </div>

        <div class="section">
            <h2>3. Privacy and Data Protection</h2>
            <p>SecureHome Audit maintains strict confidentiality regarding:</p>
            <ul>
                <li>All personal property information and valuations</li>
                <li>Property layout and security features</li>
                <li>Customer personal information</li>
                <li>Digital photos and documentation</li>
            </ul>
            <p><span class="highlight">Data is encrypted and stored securely for insurance purposes only.</span></p>
        </div>

        <div class="section">
            <h2>4. Liability and Insurance</h2>
            <p>SecureHome Audit carries professional liability insurance and agrees to:</p>
            <ul>
                <li>Exercise reasonable care during property inspection</li>
                <li>Replace or repair any damage caused by negligence</li>
                <li>Maintain professional standards at all times</li>
            </ul>
            <p><strong>Limitation:</strong> Liability is limited to the value of services rendered, not to exceed $5,000.</p>
        </div>

        <div class="section">
            <h2>5. Service Fees and Payment</h2>
            <p>Service fees are as follows:</p>
            <ul>
                <li>Basic home audit documentation: <strong>FREE</strong></li>
                <li>Title Protection monitoring (optional): <strong>$50/year</strong></li>
                <li>Additional report copies: <strong>$25 each</strong></li>
            </ul>
            <p>Payment for optional services is due at time of booking via secure payment processing.</p>
        </div>

        <div class="section">
            <h2>6. Report Delivery and Usage</h2>
            <p>The documentation report will be:</p>
            <ul>
                <li>Delivered via secure email within 48 hours</li>
                <li>Formatted for insurance company submission</li>
                <li>Available for download for 30 days</li>
                <li>Legally compliant for insurance claims</li>
            </ul>
        </div>

        <div class="section">
            <h2>7. Cancellation Policy</h2>
            <p>Either party may cancel with 24-hour notice. Refunds for paid services:</p>
            <ul>
                <li>Full refund if cancelled more than 24 hours in advance</li>
                <li>50% refund if cancelled less than 24 hours in advance</li>
                <li>No refund for no-shows or same-day cancellations</li>
            </ul>
        </div>

        <div class="signature-block">
            <h2>Agreement and Signature</h2>
            <p>By signing below, I acknowledge that I have read, understood, and agree to all terms and conditions of this service agreement.</p>
            
            <p><strong>Customer Signature:</strong></p>
            <div style="border-bottom: 1px solid #000; width: 300px; height: 40px; margin: 20px 0;"></div>
            
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>SecureHome Audit Professional Services</p>
                <p>Licensed Security Officers | Professional Documentation Services</p>
                <p>Contact: (555) 123-SECURE | support@securehomeaudit.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const docuSignService = new DocuSignService();
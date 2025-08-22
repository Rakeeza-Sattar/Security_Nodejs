import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DocuSignStatusProps {
  appointmentId: string;
  customerName: string;
  onStatusUpdate?: (status: string) => void;
}

interface DocuSignStatus {
  status: string;
  completed: boolean;
}

export function DocuSignStatus({ appointmentId, customerName, onStatusUpdate }: DocuSignStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [envelopeId, setEnvelopeId] = useState<string | null>(null);
  const [docuSignStatus, setDocuSignStatus] = useState<DocuSignStatus | null>(null);
  const { toast } = useToast();

  const sendAgreement = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/docusign/send-agreement', {
        appointmentId,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEnvelopeId(result.envelopeId);
        toast({
          title: 'Service Agreement Sent',
          description: `DocuSign agreement has been sent to ${customerName}`,
        });
        onStatusUpdate?.('agreement_sent');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Send Agreement',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!envelopeId) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/docusign/status/${envelopeId}`);
      const status = await response.json();
      
      setDocuSignStatus(status);
      onStatusUpdate?.(status.status);
      
      if (status.completed) {
        toast({
          title: 'Agreement Completed',
          description: 'Customer has signed the service agreement',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Status Check Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = async () => {
    if (!envelopeId) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/docusign/download/${envelopeId}`);
      const result = await response.json();
      
      if (result.documentBase64) {
        // Create download link
        const byteCharacters = atob(result.documentBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `service-agreement-${appointmentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Document Downloaded',
          description: 'Signed service agreement has been downloaded',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!docuSignStatus) return <Clock className="h-4 w-4" />;
    
    switch (docuSignStatus.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'delivered':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!docuSignStatus) return <Badge variant="secondary">Not Sent</Badge>;
    
    switch (docuSignStatus.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'sent':
        return <Badge variant="secondary" className="bg-yellow-600">Sent</Badge>;
      case 'delivered':
        return <Badge variant="secondary" className="bg-blue-600">Delivered</Badge>;
      default:
        return <Badge variant="outline">{docuSignStatus.status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" />
          Service Agreement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">DocuSign Status:</span>
          </div>
          {getStatusBadge()}
        </div>

        {!envelopeId ? (
          <Button
            onClick={sendAgreement}
            disabled={isLoading}
            className="w-full"
            data-testid="button-send-docusign"
          >
            <FileText className="mr-2 h-4 w-4" />
            {isLoading ? 'Sending...' : 'Send Service Agreement'}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={checkStatus}
              disabled={isLoading}
              variant="outline"
              className="w-full"
              data-testid="button-check-status"
            >
              <Clock className="mr-2 h-4 w-4" />
              {isLoading ? 'Checking...' : 'Check Status'}
            </Button>
            
            {docuSignStatus?.completed && (
              <Button
                onClick={downloadDocument}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
                data-testid="button-download-agreement"
              >
                <Download className="mr-2 h-4 w-4" />
                {isLoading ? 'Downloading...' : 'Download Signed Agreement'}
              </Button>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium">Service Agreement Process:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Send agreement via DocuSign to customer email</li>
            <li>Customer receives email with signing instructions</li>
            <li>Customer signs digitally using DocuSign interface</li>
            <li>Completed agreement is available for download</li>
          </ol>
        </div>

        {envelopeId && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span className="font-medium">Envelope ID:</span> {envelopeId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SquarePaymentFormProps {
  amount: number;
  onPaymentSuccess: (sourceId: string, paymentResult: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Square: any;
  }
}

export function SquarePaymentForm({ amount, onPaymentSuccess, onPaymentError, disabled }: SquarePaymentFormProps) {
  const [paymentForm, setPaymentForm] = useState<any>(null);
  const [cardButton, setCardButton] = useState<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.Square) {
      // Load Square Web Payments SDK
      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = initializeSquare;
      document.head.appendChild(script);
    } else {
      initializeSquare();
    }

    return () => {
      if (paymentForm) {
        paymentForm.destroy();
      }
    };
  }, []);

  const initializeSquare = async () => {
    try {
      if (!window.Square) {
        console.error('Square.js failed to load properly');
        return;
      }

      // Check if container exists
      if (!cardContainerRef.current) {
        console.error('Card container not found');
        return;
      }

      const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-wmwGKpr076ccNbqJgzjomQ';
      const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID || 'LRK1DPQQ4VFYZ';

      console.log('Initializing Square with:', { applicationId, locationId });

      const payments = window.Square.payments(applicationId, locationId);

      const card = await payments.card({
        style: {
          input: {
            fontSize: '16px',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            color: '#374151',
            backgroundColor: '#ffffff'
          },
          '.input-container': {
            borderColor: '#e5e7eb',
            borderRadius: '8px'
          },
          '.input-container.is-focus': {
            borderColor: '#3b82f6'
          },
          '.input-container.is-error': {
            borderColor: '#ef4444'
          },
          '.message-text': {
            color: '#374151'
          }
        }
      });

      await card.attach(cardContainerRef.current);

      setPaymentForm(payments);
      setCardButton(card);

      console.log('Square payment form initialized successfully');
    } catch (error) {
      console.error('Error initializing Square payment form:', error);
      onPaymentError('Failed to initialize payment form. Please check your Square credentials.');
    }
  };

  const handlePayment = async () => {
    if (!cardButton) {
      onPaymentError('Payment form not ready');
      return;
    }

    try {
      const tokenResult = await cardButton.tokenize();
      
      if (tokenResult.status === 'OK') {
        const sourceId = tokenResult.token;
        onPaymentSuccess(sourceId, tokenResult);
      } else {
        let errorMessage = 'Payment failed';
        
        if (tokenResult.errors) {
          errorMessage = tokenResult.errors.map((error: any) => error.message).join(', ');
        }
        
        onPaymentError(errorMessage);
      }
    } catch (error) {
      console.error('Payment tokenization error:', error);
      onPaymentError('Payment processing failed');
    }
  };

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="mr-2" />
          Payment Method
        </h4>
        
        {/* Square Card Input Container */}
        <div 
          ref={cardContainerRef} 
          className="mb-4 p-4 border border-gray-200 rounded-lg bg-white"
          style={{ minHeight: '120px' }}
        >
          {!cardButton && (
            <div className="text-center text-gray-500 py-8">
              Loading payment form...
            </div>
          )}
        </div>

        {amount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900">
              Total Amount: ${amount.toFixed(2)}
            </div>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={disabled || !cardButton}
          className="w-full bg-primary text-white hover:bg-blue-700"
        >
          {disabled ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>

        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center">
              <Lock className="text-blue-600 mr-2" size={16} />
              <span className="text-sm text-blue-800">Secured by Square Payment Processing</span>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
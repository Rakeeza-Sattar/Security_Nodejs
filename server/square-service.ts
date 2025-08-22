// @ts-ignore - squareup types not available
import { Client, Environment, ApiError } from "squareup";

interface PaymentRequest {
  sourceId: string;
  amountMoney: {
    amount: number;
    currency: string;
  };
  idempotencyKey: string;
  locationId: string;
  customerId?: string;
}

interface SubscriptionRequest {
  idempotencyKey: string;
  locationId: string;
  planId: string;
  customerId: string;
  startDate: string;
}

class SquareService {
  private client: Client;

  constructor() {
    const environment = process.env.SQUARE_ENVIRONMENT === 'production' 
      ? Environment.Production 
      : Environment.Sandbox;
    
    this.client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment
    });
  }

  async createPayment(request: PaymentRequest) {
    try {
      const { result } = await this.client.paymentsApi.createPayment({
        sourceId: request.sourceId,
        amountMoney: request.amountMoney,
        idempotencyKey: request.idempotencyKey,
        locationId: request.locationId,
        autocomplete: true
      });

      return {
        success: true,
        payment: result.payment,
        paymentId: result.payment?.id
      };
    } catch (error: any) {
      console.error('Square payment error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.errors?.[0]?.detail || 'Payment failed'
        };
      }
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  async createCustomer(givenName: string, familyName: string, emailAddress: string) {
    try {
      const { result } = await this.client.customersApi.createCustomer({
        givenName,
        familyName,
        emailAddress
      });

      return {
        success: true,
        customer: result.customer,
        customerId: result.customer?.id
      };
    } catch (error: any) {
      console.error('Square customer creation error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.errors?.[0]?.detail || 'Customer creation failed'
        };
      }
      return {
        success: false,
        error: 'Customer creation failed'
      };
    }
  }

  async createSubscription(request: SubscriptionRequest) {
    try {
      const { result } = await this.client.subscriptionsApi.createSubscription({
        idempotencyKey: request.idempotencyKey,
        locationId: request.locationId,
        planId: request.planId,
        customerId: request.customerId,
        startDate: request.startDate
      });

      return {
        success: true,
        subscription: result.subscription,
        subscriptionId: result.subscription?.id
      };
    } catch (error: any) {
      console.error('Square subscription error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.errors?.[0]?.detail || 'Subscription creation failed'
        };
      }
      return {
        success: false,
        error: 'Subscription creation failed'
      };
    }
  }

  // Create a catalog plan for title protection subscription
  async createTitleProtectionPlan() {
    try {
      const { result } = await this.client.catalogApi.upsertCatalogObject({
        idempotencyKey: 'title-protection-plan-' + Date.now(),
        object: {
          type: 'SUBSCRIPTION_PLAN',
          id: '#title-protection-plan',
          subscriptionPlanData: {
            name: 'Title Protection Monitoring',
            phases: [{
              cadence: 'MONTHLY',
              recurringPriceMoney: {
                amount: BigInt(5000), // $50.00 in cents
                currency: 'USD'
              }
            }]
          }
        }
      });

      return {
        success: true,
        plan: result.catalogObject,
        planId: result.catalogObject?.id
      };
    } catch (error: any) {
      console.error('Square plan creation error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.errors?.[0]?.detail || 'Plan creation failed'
        };
      }
      return {
        success: false,
        error: 'Plan creation failed'
      };
    }
  }
}

export const squareService = new SquareService();
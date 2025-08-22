interface TitleMonitoringSubscription {
  id: string;
  customerId: string;
  propertyAddress: string;
  squareSubscriptionId?: string;
  status: 'active' | 'cancelled' | 'pending';
  startDate: string;
  nextBillingDate: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  alertEmail: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface TitleAlert {
  id: string;
  subscriptionId: string;
  alertType: 'title_change' | 'lien_filed' | 'ownership_transfer' | 'court_action';
  severity: 'low' | 'medium' | 'high' | 'critical';
  propertyAddress: string;
  alertDate: string;
  description: string;
  actionRequired: boolean;
  documentUrl?: string;
  resolved: boolean;
}

class TitleMonitoringService {
  private subscriptions: Map<string, TitleMonitoringSubscription> = new Map();
  private alerts: Map<string, TitleAlert[]> = new Map();

  async createSubscription(data: {
    customerId: string;
    propertyAddress: string;
    alertEmail: string;
    frequency: 'monthly' | 'yearly';
    squareSubscriptionId?: string;
  }): Promise<{ success: boolean; subscription?: TitleMonitoringSubscription; error?: string }> {
    try {
      const subscriptionId = `tm-${Date.now()}`;
      const amount = data.frequency === 'yearly' ? 50 : 5; // $50/year or $5/month
      
      const startDate = new Date();
      const nextBillingDate = new Date();
      if (data.frequency === 'yearly') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      const subscription: TitleMonitoringSubscription = {
        id: subscriptionId,
        customerId: data.customerId,
        propertyAddress: data.propertyAddress,
        squareSubscriptionId: data.squareSubscriptionId,
        status: data.squareSubscriptionId ? 'active' : 'pending',
        startDate: startDate.toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        amount,
        frequency: data.frequency,
        alertEmail: data.alertEmail,
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      };

      this.subscriptions.set(subscriptionId, subscription);
      this.alerts.set(subscriptionId, []);

      // Start monitoring for this property
      this.startPropertyMonitoring(subscription);

      return { success: true, subscription };
    } catch (error: any) {
      console.error('Title monitoring subscription creation error:', error);
      return { success: false, error: error.message || 'Subscription creation failed' };
    }
  }

  async getSubscription(subscriptionId: string): Promise<TitleMonitoringSubscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  async getCustomerSubscriptions(customerId: string): Promise<TitleMonitoringSubscription[]> {
    return Array.from(this.subscriptions.values()).filter(sub => sub.customerId === customerId);
  }

  async updateSubscriptionStatus(subscriptionId: string, status: 'active' | 'cancelled' | 'pending'): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.status = status;
      this.subscriptions.set(subscriptionId, subscription);
      return true;
    }
    return false;
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      // Cancel Square subscription if exists
      if (subscription.squareSubscriptionId) {
        // Would integrate with Square to cancel subscription
        // const { squareService } = await import("./square-service");
        // await squareService.cancelSubscription(subscription.squareSubscriptionId);
      }

      subscription.status = 'cancelled';
      this.subscriptions.set(subscriptionId, subscription);

      return { success: true };
    } catch (error: any) {
      console.error('Title monitoring cancellation error:', error);
      return { success: false, error: error.message || 'Cancellation failed' };
    }
  }

  async getAlerts(subscriptionId: string): Promise<TitleAlert[]> {
    return this.alerts.get(subscriptionId) || [];
  }

  async addAlert(subscriptionId: string, alertData: Omit<TitleAlert, 'id' | 'subscriptionId'>): Promise<TitleAlert> {
    const alertId = `alert-${Date.now()}`;
    const alert: TitleAlert = {
      id: alertId,
      subscriptionId,
      ...alertData,
    };

    const existingAlerts = this.alerts.get(subscriptionId) || [];
    existingAlerts.push(alert);
    this.alerts.set(subscriptionId, existingAlerts);

    // Send alert notification
    await this.sendAlertNotification(subscriptionId, alert);

    return alert;
  }

  async markAlertResolved(subscriptionId: string, alertId: string): Promise<boolean> {
    const alerts = this.alerts.get(subscriptionId) || [];
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      alerts[alertIndex].resolved = true;
      this.alerts.set(subscriptionId, alerts);
      return true;
    }
    
    return false;
  }

  private async startPropertyMonitoring(subscription: TitleMonitoringSubscription): Promise<void> {
    // In a real implementation, this would:
    // 1. Register with title monitoring APIs (like TitleIQ, PropertyRadar, etc.)
    // 2. Set up webhook endpoints for real-time notifications
    // 3. Schedule periodic checks for title changes
    
    console.log(`Started title monitoring for ${subscription.propertyAddress}`);
    
    // Simulate some initial monitoring data
    setTimeout(() => {
      this.simulateMonitoringCheck(subscription);
    }, 5000);
  }

  private async simulateMonitoringCheck(subscription: TitleMonitoringSubscription): Promise<void> {
    // This simulates a title monitoring check
    // In production, this would query actual title databases
    
    const shouldCreateAlert = Math.random() < 0.1; // 10% chance of finding something
    
    if (shouldCreateAlert) {
      await this.addAlert(subscription.id, {
        alertType: 'title_change',
        severity: 'medium',
        propertyAddress: subscription.propertyAddress,
        alertDate: new Date().toISOString(),
        description: 'Routine title database check completed - no changes detected',
        actionRequired: false,
        resolved: false,
      });
    }
  }

  private async sendAlertNotification(subscriptionId: string, alert: TitleAlert): Promise<void> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) return;

      if (subscription.notifications.email) {
        // Send email notification
        const { emailService } = await import("./email-service");
        
        // You would implement a title alert email template in email-service
        console.log(`Sending title alert email to ${subscription.alertEmail}`);
        
        // Example alert email (would implement proper template)
        // await emailService.sendTitleAlert(subscription.alertEmail, alert);
      }

      if (subscription.notifications.sms) {
        // Send SMS notification (would integrate with Twilio)
        console.log(`Sending SMS alert for ${alert.alertType}`);
      }

      if (subscription.notifications.push) {
        // Send push notification (would integrate with FCM/APN)
        console.log(`Sending push notification for ${alert.alertType}`);
      }
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  // Admin functions
  async getAllSubscriptions(): Promise<TitleMonitoringSubscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    totalAlerts: number;
    criticalAlerts: number;
  }> {
    const allSubscriptions = Array.from(this.subscriptions.values());
    const allAlerts = Array.from(this.alerts.values()).flat();
    
    return {
      totalSubscriptions: allSubscriptions.length,
      activeSubscriptions: allSubscriptions.filter(s => s.status === 'active').length,
      monthlyRevenue: allSubscriptions
        .filter(s => s.frequency === 'monthly' && s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
      yearlyRevenue: allSubscriptions
        .filter(s => s.frequency === 'yearly' && s.status === 'active')
        .reduce((sum, s) => sum + s.amount, 0),
      totalAlerts: allAlerts.length,
      criticalAlerts: allAlerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    };
  }
}

export const titleMonitoringService = new TitleMonitoringService();
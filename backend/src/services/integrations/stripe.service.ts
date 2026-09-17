import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class StripeIntegrationService {
  /**
   * Verifies the Stripe webhook signature securely
   * In a real environment, this would use the official stripe-node SDK: stripe.webhooks.constructEvent()
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    if (process.env.NODE_ENV === 'development' && !secret) {
      // Allow bypass in dev if no secret configured
      return true;
    }
    
    try {
      // Simplified HMAC verification for demonstration/stub purposes
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('hex');
      return signature.includes(digest);
    } catch (e) {
      logger.error('Stripe signature verification failed', { error: e });
      return false;
    }
  }

  /**
   * Processes a Stripe webhook event
   */
  static async processWebhook(event: any) {
    logger.info(`Processing Stripe webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        default:
          logger.info(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      logger.error(`Error processing Stripe event ${event.type}`, { error });
      throw error;
    }
  }

  /**
   * Handle successful charges by creating a FinancialRecord (Revenue)
   */
  private static async handleChargeSucceeded(charge: any) {
    // 1. Resolve which Business this charge belongs to based on the Stripe Account ID or customer metadata
    const integration = await prisma.externalIntegration.findFirst({
      where: {
        provider: 'STRIPE',
        // In a Connect ecosystem, we'd match the connected account ID
        // externalId: charge.account
      }
    });

    if (!integration) {
      logger.warn(`No active Stripe integration found for charge`, { chargeId: charge.id });
      return;
    }

    // 2. Map Stripe charge to our Unified FinancialRecord
    await prisma.financialRecord.create({
      data: {
        businessId: integration.businessId,
        type: 'INFLOW',
        category: 'REVENUE',
        amount: charge.amount / 100, // Stripe amounts are in cents
        currency: charge.currency.toUpperCase(),
        transactionDate: new Date(charge.created * 1000),
        status: 'COMPLETED',
        description: charge.description || 'Stripe Charge',
      }
    });

    logger.info(`Created FinancialRecord for Stripe charge`, { chargeId: charge.id, amount: charge.amount / 100 });
  }

  private static async handleSubscriptionUpdated(subscription: any) {
    // Update ARR/MRR metrics in a real-world scenario
    logger.info(`Subscription updated`, { subscriptionId: subscription.id });
  }

  private static async handleInvoicePaymentSucceeded(invoice: any) {
    logger.info(`Invoice payment succeeded`, { invoiceId: invoice.id });
  }
}

import { Router, Request, Response } from 'express';
import { StripeIntegrationService } from '../services/integrations/stripe.service';
import { PlaidIntegrationService } from '../services/integrations/plaid.service';
import { logger } from '../utils/logger';

const router = Router();

// Endpoint for Stripe Webhooks
// Note: Stripe requires the raw body to verify the signature. 
// Assuming `app.use(express.json())` is configured to keep raw body or we process it here.
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    // Verify signature (using a mock or real implementation in the service)
    const isValid = StripeIntegrationService.verifySignature(JSON.stringify(req.body), signature, webhookSecret);
    
    if (!isValid) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(400).send('Webhook Error: Invalid Signature');
    }

    // Process the event asynchronously
    // (Stripe expects a 200 OK immediately, so we don't await the full processing if it's long-running)
    StripeIntegrationService.processWebhook(req.body).catch(err => {
      logger.error('Failed to process Stripe webhook asynchronously', { error: err });
    });

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', { error });
    res.status(400).send(`Webhook Error`);
  }
});

// Endpoint for Plaid Webhooks
router.post('/plaid', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Process the event
    PlaidIntegrationService.processWebhook(event).catch(err => {
      logger.error('Failed to process Plaid webhook asynchronously', { error: err });
    });

    res.json({ received: true });
  } catch (error) {
    logger.error('Plaid webhook error', { error });
    res.status(400).send(`Webhook Error`);
  }
});

export const webhookRouter = router;

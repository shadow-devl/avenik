import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class PlaidIntegrationService {
  /**
   * Processes a Plaid webhook event (e.g., SYNC_UPDATES_AVAILABLE)
   */
  static async processWebhook(event: any) {
    logger.info(`Processing Plaid webhook: ${event.webhook_type} - ${event.webhook_code}`);

    try {
      if (event.webhook_type === 'TRANSACTIONS') {
        switch (event.webhook_code) {
          case 'SYNC_UPDATES_AVAILABLE':
          case 'INITIAL_UPDATE':
          case 'HISTORICAL_UPDATE':
            await this.handleTransactionsUpdate(event.item_id);
            break;
          default:
            logger.info(`Unhandled Plaid transactions event: ${event.webhook_code}`);
        }
      }
    } catch (error) {
      logger.error(`Error processing Plaid event ${event.webhook_code}`, { error });
      throw error;
    }
  }

  /**
   * Fetch new transactions from Plaid API and map to FinancialRecords
   */
  private static async handleTransactionsUpdate(itemId: string) {
    // 1. Resolve which Business this Plaid item belongs to
    const integration = await prisma.externalIntegration.findFirst({
      where: {
        provider: 'PLAID',
        externalId: itemId,
      }
    });

    if (!integration) {
      logger.warn(`No active Plaid integration found for Item ID`, { itemId });
      return;
    }

    logger.info(`Syncing transactions for business ${integration.businessId} via Plaid`);
    
    // In a real environment, we would use the Plaid Node SDK to fetch transactions using the access_token:
    // const response = await plaidClient.transactionsSync({ access_token, ... });
    
    // For demonstration, we will log the intent.
    // When transactions are retrieved, they would be mapped and inserted into the `financial_records` table,
    // carefully avoiding duplicates using Plaid's transaction_id mapped to a unique column or checking existing records.

    // Update last sync time
    await prisma.externalIntegration.update({
      where: { id: integration.id },
      data: { lastSync: new Date() }
    });
  }
}

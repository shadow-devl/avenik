import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { success } from '../utils/response';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all active integrations for a business
router.get('/', async (req, res, next) => {
  try {
    const businessId = req.query.businessId as string;
    if (!businessId) {
      throw new AppError('Business ID is required', 400);
    }

    const integrations = await prisma.externalIntegration.findMany({
      where: { businessId }
    });

    return success(res, integrations);
  } catch (error) {
    next(error);
  }
});

// Toggle (Connect/Disconnect) an integration
router.post('/toggle', async (req, res, next) => {
  try {
    const businessId = req.query.businessId as string;
    const { provider, active } = req.body; // e.g. provider: 'STRIPE', active: true

    if (!businessId || !provider) {
      throw new AppError('Business ID and provider are required', 400);
    }

    // In a real app, 'active: true' would start an OAuth flow. 
    // Here we just mock the connection status.
    
    if (active) {
      const integration = await prisma.externalIntegration.upsert({
        where: {
          businessId_provider: {
            businessId,
            provider
          }
        },
        update: {
          status: 'ACTIVE',
          updatedAt: new Date()
        },
        create: {
          businessId,
          provider,
          status: 'ACTIVE',
          // Mock external ID
          externalId: `mock_${provider.toLowerCase()}_${Date.now()}`
        }
      });
      return success(res, integration);
    } else {
      const integration = await prisma.externalIntegration.update({
        where: {
          businessId_provider: {
            businessId,
            provider
          }
        },
        data: {
          status: 'DISCONNECTED',
          updatedAt: new Date()
        }
      });
      return success(res, integration);
    }

  } catch (error) {
    next(error);
  }
});

export const integrationsRouter = router;

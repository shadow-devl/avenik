import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';
import { ContextService } from '../services/context.service.js';

const router = Router();

// Match a business against active schemes
router.post('/match', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    
    if (!businessId) {
      throw new AppError('Business ID is required', 400);
    }

    // P0: Enforce authorization and tenant isolation
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    
    const context = await ContextService.resolve({ userId, requestedBusinessId: businessId });
    if (!context.business) {
      throw new AppError('Business not found or access denied', 403);
    }
    const business = context.business;

    const activeSchemes = await prisma.governmentScheme.findMany({
      where: { status: 'ACTIVE' }
    });

    if (activeSchemes.length === 0) {
      return success(res, [], 'No active schemes available for matching at this time.');
    }

    const matches = [];

    for (const scheme of activeSchemes) {
      // SIH DEMO: Heuristic matching to simulate AI Engine
      let confidence = 0.5;
      
      const title = scheme.title.toLowerCase();
      
      if (title.includes('stand-up') || title.includes('mudra') || title.includes('employment')) {
        confidence += 0.35; // High confidence match for marginalized rural entrepreneur
      }
      
      if (confidence > 0.7) {
        const application = await prisma.schemeApplication.upsert({
          where: {
            businessId_schemeId: {
              businessId: business.id,
              schemeId: scheme.id
            }
          },
          update: {
            matchConfidence: confidence,
            status: 'DISCOVERED'
          },
          create: {
            businessId: business.id,
            schemeId: scheme.id,
            matchConfidence: confidence,
            status: 'DISCOVERED',
            missingEvidence: 'Business Registration Certificate, Pitch Deck'
          },
          include: {
            scheme: true
          }
        });
        matches.push(application);
      }
    }

    success(res, matches, `Successfully matched ${matches.length} government schemes.`);
  } catch (error) {
    next(error);
  }
});

// Retrieve discovered schemes for a business
router.get('/matches/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    
    // P0: Enforce authorization
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }
    
    const context = await ContextService.resolve({ userId, requestedBusinessId: businessId });
    if (!context.business) {
      throw new AppError('Business not found or access denied', 403);
    }

    const matches = await prisma.schemeApplication.findMany({
      where: { businessId: businessId as string },
      include: { scheme: true }
    });
    success(res, matches, 'Matches retrieved.');
  } catch (error) {
    next(error);
  }
});

export default router;

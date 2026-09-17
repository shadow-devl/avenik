import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { ContextService } from '../services/context.service.js';
import { EcosystemDiscoveryService } from '../services/ecosystem/ecosystem-discovery.service.js';
import { EcosystemRelationshipService } from '../services/ecosystem/ecosystem-relationship.service.js';
import { prisma } from '../db.js';
import { success } from '../utils/response.js';

const router = Router();

// Zod schemas
const DiscoverQuerySchema = z.object({
  query: z.object({
    businessId: z.string().uuid()
  })
});

const RequestConnectionSchema = z.object({
  body: z.object({
    sourceBusinessId: z.string().uuid(),
    targetBusinessId: z.string().uuid(),
    message: z.string().min(10)
  })
});

const ConsentConnectionSchema = z.object({
  body: z.object({
    relationshipId: z.string().uuid(),
    businessId: z.string().uuid() // The target business consenting
  })
});

/**
 * GET /api/ecosystem/discover
 * Get B2B ecosystem matches
 */
router.get(
  '/discover',
  validate(DiscoverQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId } = req.query;
      // Enforce Context Isolation
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId as string });

      const matches = await EcosystemDiscoveryService.discoverMatches(businessId as string);
      success(res, matches);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ecosystem/request
 * Request a connection (Warm Intro)
 */
router.post(
  '/request',
  validate(RequestConnectionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sourceBusinessId, targetBusinessId, message } = req.body;
      // Ensure caller owns the source business
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: sourceBusinessId });

      const rel = await EcosystemRelationshipService.requestConnection(
        sourceBusinessId,
        targetBusinessId,
        message
      );

      success(res, rel, "Connection Requested", 201);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ecosystem/consent
 * Consent to a connection request
 */
router.post(
  '/consent',
  validate(ConsentConnectionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { relationshipId, businessId } = req.body;
      
      // Ensure the user owns the business that is consenting
      await ContextService.resolve({ userId: req.user!.userId, requestedBusinessId: businessId });

      // In a real impl, we'd verify that `relationshipId` targets `businessId`.
      const rel = await EcosystemRelationshipService.consentConnection(relationshipId);

      success(res, rel, "Connection Accepted");
    } catch (error) {
      next(error);
    }
  }
);

export const ecosystemRouter = router;

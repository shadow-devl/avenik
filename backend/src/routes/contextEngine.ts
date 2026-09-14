import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { success } from '../utils/response.js';

// Assuming req.user is populated by some auth middleware (not fully implemented in this mock)
// We'll mock the auth check for the purpose of the API if it's not strictly present in this route yet.

const router = Router();

router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app with auth middleware, we'd use req.user.id
    // For now, we will take a businessId from query or body to demonstrate the context engine,
    // or just return the first business in the DB if none provided, to ensure the SIH Demo works.
    
    const businessId = req.query.businessId as string;
    
    let business;
    if (businessId) {
      business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          healthRecords: { orderBy: { calculatedAt: 'desc' }, take: 1 },
          goals: { where: { status: 'ACTIVE' }, take: 3 },
          tasks: { where: { status: 'TODO' }, take: 5 },
          recommendations: { where: { status: 'ACTIVE' }, orderBy: { urgencyScore: 'desc' }, take: 3 },
          trustProfile: true
        }
      });
    } else {
      business = await prisma.business.findFirst({
        include: {
          healthRecords: { orderBy: { calculatedAt: 'desc' }, take: 1 },
          goals: { where: { status: 'ACTIVE' }, take: 3 },
          tasks: { where: { status: 'TODO' }, take: 5 },
          recommendations: { where: { status: 'ACTIVE' }, orderBy: { urgencyScore: 'desc' }, take: 3 },
          trustProfile: true
        }
      });
    }

    if (!business) {
      return success(res, {
        hasBusiness: false,
        message: 'No business profile found. Please create a business to initialize the Context Engine.'
      });
    }

    // Construct the Unified Entrepreneur State
    const context = {
      hasBusiness: true,
      businessId: business.id,
      businessName: business.displayName,
      healthScore: business.healthRecords[0]?.score || 0,
      trustLevel: business.trustProfile?.verificationLevel || 'UNVERIFIED',
      activeGoals: business.goals,
      pendingTasks: business.tasks,
      nextBestActions: business.recommendations
    };

    success(res, context, 'Entrepreneur context retrieved successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;

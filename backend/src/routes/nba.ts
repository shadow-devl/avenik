import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { success } from '../utils/response.js';

const router = Router();

// Endpoint to generate Next-Best-Actions (Recommendations) based on Goal and Health Context
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'businessId is required' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        goals: { where: { status: 'ACTIVE' } },
        healthRecords: { orderBy: { calculatedAt: 'desc' }, take: 1 }
      }
    });

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Heuristics for Next-Best-Action generation
    const newRecommendations = [];
    const healthScore = business.healthRecords[0]?.score || 0;

    if (healthScore < 50) {
      newRecommendations.push({
        businessId: business.id,
        title: 'Critical Health Score Alert',
        description: 'Your business health score has dropped below 50. Review working capital and expenses immediately.',
        category: 'FINANCE',
        sourceAiModel: 'Business Health Engine',
        confidenceScore: 0.95,
        urgencyScore: 1.0,
        status: 'ACTIVE'
      });
    }

    // Check goals
    const fundingGoal = business.goals.find(g => g.category === 'FUNDING');
    if (fundingGoal) {
      newRecommendations.push({
        businessId: business.id,
        title: 'Upload Pitch Deck',
        description: `Your goal "${fundingGoal.title}" is missing required evidence. Upload your pitch deck to unlock investor matching.`,
        category: 'COMPLIANCE',
        sourceAiModel: 'Goal Intelligence Engine',
        confidenceScore: 0.90,
        urgencyScore: 0.80,
        status: 'ACTIVE'
      });
    }

    // Save recommendations if they don't already exist for this context
    const createdRecs = [];
    for (const rec of newRecommendations) {
      const existing = await prisma.recommendation.findFirst({
        where: { businessId: rec.businessId, title: rec.title, status: 'ACTIVE' }
      });
      if (!existing) {
        const created = await prisma.recommendation.create({ data: rec });
        createdRecs.push(created);
      }
    }

    // Return active recommendations
    const activeRecs = await prisma.recommendation.findMany({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { urgencyScore: 'desc' }
    });

    success(res, activeRecs, 'Next-Best-Actions generated successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;

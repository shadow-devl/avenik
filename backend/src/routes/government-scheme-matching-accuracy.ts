import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { ContextService } from '../services/context.service.js';
import { IntentExtractionService } from '../services/intent/intent-extraction.service.js';
import { HybridSearchService } from '../services/search/hybrid-search.service.js';
import { ExplanationService } from '../services/explanation/explanation.service.js';
import { SchemeEmbeddingService } from '../services/embedding/scheme-embedding.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * 🚀 TRACK 1: NEW HYBRID DISCOVERY PIPELINE
 * POST /discover
 * Body: { businessId: string, query: string }
 */
router.post('/discover', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId, query } = req.body;
    if (!businessId || !query) {
      res.status(400).json({ success: false, error: 'businessId and query are required' });
      return;
    }

    // 1. Context Authorization
    await ContextService.resolve({ userId: req.user.userId, requestedBusinessId: businessId });
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      res.status(404).json({ success: false, error: 'Business not found' });
      return;
    }

    // 2. Intent Extraction (AI Inference)
    const intent = await IntentExtractionService.extractAndSave(businessId, query);

    // 3. Semantic Hybrid Search
    const candidates = await HybridSearchService.discoverCandidates(intent, 5);

    // 4. Hard Eligibility & Explanation Scoring
    const results = [];
    for (const scheme of candidates) {
      const matchResult = await ExplanationService.generateMatchResult(intent, business, scheme);
      results.push(matchResult);
    }

    // 5. Return sorted results
    results.sort((a, b) => (b.semanticScore || 0) - (a.semanticScore || 0));

    res.json({
      success: true,
      intent,
      data: results
    });
  } catch (error: any) {
    logger.error('Hybrid discovery failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Admin Route: Trigger embedding generation
 * POST /admin/embed-all
 */
router.post('/admin/embed-all', async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic protection - should use proper roles
    const context = await ContextService.resolve({ userId: req.user.userId });
    if (!context.permissions.includes('ALL')) {
      res.status(403).json({ success: false, error: 'Requires ADMIN role' });
      return;
    }

    const result = await SchemeEmbeddingService.embedAllSchemes();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * LEGACY HEURISTIC MATCHER (Kept for backward compatibility and tests)
 * POST /match
 */
router.post('/match', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      res.status(400).json({ success: false, error: 'businessId is required' });
      return;
    }

    await ContextService.resolve({ userId: req.user.userId, requestedBusinessId: businessId });

    const activeSchemes = await prisma.governmentScheme.findMany({
      where: { status: 'ACTIVE' }
    });

    const applications = [];

    for (const scheme of activeSchemes) {
      const titleLower = scheme.title.toLowerCase();
      
      let confidence = 0.0;
      let missingEvidence = 'Business Registration, Identity Proof';
      let isMatch = false;

      if (titleLower.includes('stand-up') || titleLower.includes('mudra')) {
        confidence = 0.85;
        isMatch = true;
      } else if (titleLower.includes('employment')) {
        confidence = 0.70;
        isMatch = true;
        missingEvidence = 'Project Report, Caste Certificate (if applicable)';
      }

      if (isMatch) {
        const application = await prisma.schemeApplication.upsert({
          where: {
            businessId_schemeId: { businessId, schemeId: scheme.id }
          },
          update: {
            matchConfidence: confidence,
            missingEvidence,
            status: 'DISCOVERED'
          },
          create: {
            businessId,
            schemeId: scheme.id,
            matchConfidence: confidence,
            missingEvidence,
            status: 'DISCOVERED'
          }
        });
        applications.push(application);
      }
    }

    const savedMatches = await prisma.schemeApplication.findMany({
      where: { businessId },
      include: { scheme: true }
    });

    res.json({ success: true, data: savedMatches });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /matches/:businessId
 */
router.get('/matches/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    
    await ContextService.resolve({ userId: req.user.userId, requestedBusinessId: businessId });

    // Return Track 1 Match Results instead of legacy applications if they exist
    const track1Results = await prisma.schemeMatchResult.findMany({
      where: { businessId },
      include: { scheme: true, intent: true },
      orderBy: { semanticScore: 'desc' }
    });

    if (track1Results.length > 0) {
      // Map to legacy format for frontend compatibility until frontend is updated
      const mapped = track1Results.map(r => ({
        id: r.id,
        businessId: r.businessId,
        schemeId: r.schemeId,
        status: r.eligibilityStatus,
        matchConfidence: r.semanticScore || 0,
        missingEvidence: JSON.parse(r.missingInfo || '[]').join(', '),
        scheme: r.scheme,
        isTrack1: true
      }));
      res.json({ success: true, data: mapped });
      return;
    }

    const legacyMatches = await prisma.schemeApplication.findMany({
      where: { businessId },
      include: { scheme: true }
    });

    res.json({ success: true, data: legacyMatches });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import { prisma } from '../../db.js';

export class TrustedIntelligenceService {
  static async getMetrics(businessId: string) {
    const profile = await prisma.trustProfile.findFirst({
      where: { businessId }
    });

    const verificationClaims = await prisma.verificationClaim.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const fraudCases = await prisma.fraudCase.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const activeFraudCases = fraudCases.filter(f => f.status === 'OPEN' || f.status === 'INVESTIGATING').length;
    const pendingVerifications = verificationClaims.filter(v => v.status === 'PENDING').length;

    // Calculate a dynamic trust penalty based on fraud flags and active cases
    let currentScore = profile?.trustScore || 85;
    if (profile?.fraudFlags) currentScore -= (profile.fraudFlags * 10);
    if (activeFraudCases > 0) currentScore -= (activeFraudCases * 15);
    
    // Floor at 0
    currentScore = Math.max(0, currentScore);

    return {
      overview: {
        trustScore: currentScore,
        verificationLevel: profile?.verificationLevel || 'UNVERIFIED',
        fraudFlags: profile?.fraudFlags || 0,
        activeFraudCases,
        pendingVerifications
      },
      verificationClaims: verificationClaims.slice(0, 10).map(v => ({
        id: v.id,
        type: v.type,
        status: v.status,
        updatedAt: v.updatedAt
      })),
      fraudHistory: fraudCases.slice(0, 10).map(f => ({
        id: f.id,
        type: f.type,
        status: f.status,
        severity: f.severity,
        createdAt: f.createdAt
      }))
    };
  }
}

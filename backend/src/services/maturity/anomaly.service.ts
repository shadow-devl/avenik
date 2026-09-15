import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Phase 12.2 — Anomaly Detection & Prescriptive Intelligence
 * Detects unusual metrics and provides options/trade-offs/recommendations.
 */
export class AnomalyService {
  /**
   * Scan business financials for anomalies by comparing recent vs. historical averages.
   */
  static async detectAnomalies(businessId: string) {
    const records = await prisma.financialRecord.findMany({
      where: { businessId },
      orderBy: { transactionDate: 'desc' },
      take: 50,
    });

    if (records.length < 5) return [];

    // Group by category and compute average + detect outliers
    const categoryGroups: Record<string, number[]> = {};
    for (const r of records) {
      const cat = r.category || 'UNKNOWN';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(Number(r.amount));
    }

    const anomalies: any[] = [];

    for (const [category, amounts] of Object.entries(categoryGroups)) {
      if (amounts.length < 3) continue;

      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const latest = amounts[0];
      const deviationPct = avg !== 0 ? ((latest - avg) / avg) * 100 : 0;

      if (Math.abs(deviationPct) > 30) {
        const severity = Math.abs(deviationPct) > 100 ? 'CRITICAL'
          : Math.abs(deviationPct) > 60 ? 'HIGH'
          : Math.abs(deviationPct) > 30 ? 'MEDIUM' : 'LOW';

        const anomaly = await prisma.anomalyDetection.create({
          data: {
            businessId,
            domain: category.includes('REVENUE') ? 'REVENUE' : 'EXPENSE',
            metric: category,
            expectedValue: avg,
            actualValue: latest,
            deviationPct,
            severity,
            prescription: {
              options: [
                `Review recent ${category} transactions`,
                `Compare with industry benchmarks`,
                `Adjust forecasts to reflect new trend`,
              ],
              tradeOffs: [
                `Ignoring may lead to inaccurate forecasts`,
                `Investigation requires time but improves accuracy`,
              ],
              recommendation: deviationPct > 0
                ? `Positive deviation — investigate if sustainable growth or anomaly`
                : `Negative deviation — investigate root cause and containment options`,
            },
          },
        });
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * Get all anomalies for a business, optionally filtered.
   */
  static async getAnomalies(businessId: string, filters?: { domain?: string; severity?: string; status?: string }) {
    return prisma.anomalyDetection.findMany({
      where: {
        businessId,
        ...(filters?.domain && { domain: filters.domain }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { detectedAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Update anomaly status (e.g., mark as INVESTIGATING, RESOLVED, DISMISSED).
   */
  static async updateAnomalyStatus(id: string, status: string, rootCause?: string) {
    return prisma.anomalyDetection.update({
      where: { id },
      data: {
        status,
        ...(rootCause && { rootCause }),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    });
  }
}

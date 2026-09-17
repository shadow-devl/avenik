import { prisma } from '../../db.js';

export class WorkforceService {
  /**
   * Assesses current workforce capacity vs. required capacity
   */
  static async assessCapacity(businessId: string, roleName: string, currentFTE: number, requiredFTE: number) {
    const overloaded = currentFTE < requiredFTE;

    const capacity = await prisma.workforceCapacity.create({
      data: {
        businessId,
        roleName,
        currentFTE,
        requiredFTE,
        overloaded
      }
    });

    return {
      capacity,
      recommendation: overloaded 
        ? `You are understaffed in ${roleName} by ${requiredFTE - currentFTE} FTE. Consider hiring or outsourcing.`
        : `Your ${roleName} capacity is sufficient.`
    };
  }

  /**
   * Identifies capability gaps based on business goals
   */
  static async identifyCapabilityGap(businessId: string, skillName: string, currentLevel: number, requiredLevel: number) {
    const gap = await prisma.capabilityGap.create({
      data: {
        businessId,
        skillName,
        currentLevel,
        requiredLevel
      }
    });

    return gap;
  }

  static async getWorkforceMetrics(businessId: string) {
    const capacities = await prisma.workforceCapacity.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const gaps = await prisma.capabilityGap.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const totalFTE = capacities.reduce((sum, c) => sum + c.currentFTE, 0);
    const requiredFTE = capacities.reduce((sum, c) => sum + c.requiredFTE, 0);
    const overloadedRoles = capacities.filter(c => c.overloaded).length;
    
    let workforceHealth = 100 - (overloadedRoles * 15) - (gaps.length * 5);
    workforceHealth = Math.max(0, Math.min(100, workforceHealth));

    return {
      workforceHealth,
      totalFTE,
      requiredFTE,
      overloadedRoles,
      capacities: capacities.map(c => ({
        id: c.id,
        role: c.roleName,
        current: c.currentFTE,
        required: c.requiredFTE,
        isOverloaded: c.overloaded
      })),
      capabilityGaps: gaps.map(g => ({
        id: g.id,
        skill: g.skillName,
        current: g.currentLevel,
        required: g.requiredLevel
      }))
    };
  }
}

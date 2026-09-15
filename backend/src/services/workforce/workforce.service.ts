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
}

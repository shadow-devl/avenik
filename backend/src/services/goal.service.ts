import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ContextService, ContextRequest, UnifiedContext } from './context.service.js';

export interface CreateGoalDTO {
  title: string;
  description?: string;
  category: string;
  type?: 'GOAL' | 'OBJECTIVE' | 'MILESTONE';
  parentGoalId?: string;
  targetDate?: Date;
  baseline?: number;
  target?: number;
  unit?: string;
  priority?: string;
  visibility?: string;
}

export class GoalService {
  /**
   * Creates a goal and attaches it securely to the business context.
   */
  static async createGoal(contextReq: ContextRequest, data: CreateGoalDTO) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required to create a goal', 400);
    }

    if (data.parentGoalId) {
      const parent = await prisma.goal.findFirst({
        where: { id: data.parentGoalId, businessId: context.business.id }
      });
      if (!parent) {
        throw new AppError('Parent goal not found or unauthorized', 404);
      }
      
      // Enforce hierarchy rules if needed (e.g. MILESTONE can't be parent of GOAL)
      if (parent.type === 'MILESTONE') {
        throw new AppError('Milestones cannot have child goals', 400);
      }
    }

    const goal = await prisma.goal.create({
      data: {
        businessId: context.business.id,
        ownerUserId: context.user.id,
        parentGoalId: data.parentGoalId,
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type || 'GOAL',
        source: 'USER',
        provenance: 'USER_REPORTED',
        priority: data.priority || 'MEDIUM',
        targetDate: data.targetDate,
        baseline: data.baseline,
        target: data.target,
        unit: data.unit,
        visibility: data.visibility || 'PRIVATE',
      }
    });

    await prisma.auditEvent.create({
      data: {
        action: 'CREATE_GOAL',
        resourceType: 'GOAL',
        resourceId: goal.id,
        actorUserId: context.user.id,
        result: 'SUCCESS',
        ipAddress: 'internal',
      }
    });

    return goal;
  }

  static async getGoals(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required', 400);
    }

    return prisma.goal.findMany({
      where: { businessId: context.business.id },
      include: {
        children: true,
      }
    });
  }

  static async updateProgress(contextReq: ContextRequest, goalId: string, newProgress: number) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required', 400);
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, businessId: context.business.id }
    });

    if (!goal) {
      throw new AppError('Goal not found', 404);
    }

    if (newProgress < 0 || newProgress > 100) {
      throw new AppError('Progress must be between 0 and 100', 400);
    }

    // Deterministic progression state
    let status = goal.status;
    let completedAt = goal.completedAt;

    if (newProgress === 100) {
      status = 'COMPLETED';
      completedAt = new Date();
    } else if (newProgress > 0 && goal.status === 'DRAFT') {
      status = 'ACTIVE';
    }

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        progress: newProgress,
        status,
        completedAt,
        updatedAt: new Date()
      }
    });

    return updated;
  }
}

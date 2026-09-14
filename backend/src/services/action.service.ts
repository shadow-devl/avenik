import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { ContextService, ContextRequest } from './context.service.js';

export interface CreateActionDTO {
  title: string;
  description?: string;
  goalId?: string;
  assigneeUserId?: string;
  type?: 'ACTION' | 'CHECKLIST_ITEM';
  priority?: string;
  dueDate?: Date;
  source?: string;
  provenance?: string;
  evidenceRequirement?: string;
  visibility?: string;
  executionPlan?: string;
}

export class ActionService {
  static async createAction(contextReq: ContextRequest, data: CreateActionDTO) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required to create an action', 400);
    }

    if (data.goalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: data.goalId, businessId: context.business.id }
      });
      if (!goal) {
        throw new AppError('Associated goal not found or unauthorized', 404);
      }
    }

    const action = await prisma.action.create({
      data: {
        businessId: context.business.id,
        goalId: data.goalId,
        assigneeUserId: data.assigneeUserId || context.user.id,
        title: data.title,
        description: data.description,
        type: data.type || 'ACTION',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate,
        source: data.source || 'USER',
        provenance: data.provenance || 'USER_REPORTED',
        evidenceRequirement: data.evidenceRequirement,
        visibility: data.visibility || 'PRIVATE',
        executionPlan: data.executionPlan,
      }
    });

    await prisma.auditEvent.create({
      data: {
        action: 'CREATE_ACTION',
        resourceType: 'ACTION',
        resourceId: action.id,
        actorUserId: context.user.id,
        result: 'SUCCESS',
        ipAddress: 'internal',
      }
    });

    return action;
  }

  static async getActions(contextReq: ContextRequest) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required', 400);
    }

    return prisma.action.findMany({
      where: { businessId: context.business.id },
      include: {
        dependencies: true,
        blocks: true,
      }
    });
  }

  static async updateStatus(contextReq: ContextRequest, actionId: string, newStatus: string) {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required', 400);
    }

    const action = await prisma.action.findFirst({
      where: { id: actionId, businessId: context.business.id },
      include: { dependencies: { include: { dependsOnAction: true } } }
    });

    if (!action) {
      throw new AppError('Action not found', 404);
    }

    if (newStatus === 'DONE') {
      // Check if any BLOCKING dependencies are not DONE
      const uncompletedDependencies = action.dependencies.filter(
        d => d.type === 'BLOCKS' && d.dependsOnAction.status !== 'DONE'
      );
      if (uncompletedDependencies.length > 0) {
        throw new AppError('Cannot complete action: unmet dependencies', 400);
      }
    }

    const updated = await prisma.action.update({
      where: { id: actionId },
      data: {
        status: newStatus,
        completedAt: newStatus === 'DONE' ? new Date() : null,
        updatedAt: new Date()
      }
    });

    return updated;
  }

  static async addDependency(contextReq: ContextRequest, actionId: string, dependsOnActionId: string, type: 'BLOCKS' | 'RELATES_TO' = 'BLOCKS') {
    const context = await ContextService.resolve(contextReq);
    if (!context.business) {
      throw new AppError('A business context is required', 400);
    }

    // Verify both actions exist in this business context
    const [action, dependsOn] = await Promise.all([
      prisma.action.findFirst({ where: { id: actionId, businessId: context.business.id } }),
      prisma.action.findFirst({ where: { id: dependsOnActionId, businessId: context.business.id } })
    ]);

    if (!action || !dependsOn) {
      throw new AppError('One or both actions not found', 404);
    }

    if (actionId === dependsOnActionId) {
      throw new AppError('Action cannot depend on itself', 400);
    }

    const dependency = await prisma.actionDependency.create({
      data: {
        actionId,
        dependsOnActionId,
        type
      }
    });

    return dependency;
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Phase 13.2 — Autonomous Agent Workforce & Execution
 */
export class AgentWorkforceService {
  /**
   * Create a new agent task.
   */
  static async createTask(data: {
    businessId: string; userId: string; agentType: string; purpose: string;
    autonomyLevel?: number; tools?: string[]; riskLevel?: string;
    budget?: { maxToolCalls?: number; maxDuration?: number };
  }) {
    const task = await prisma.agentTask.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        agentType: data.agentType,
        purpose: data.purpose,
        autonomyLevel: data.autonomyLevel || 0,
        tools: data.tools || [],
        riskLevel: data.riskLevel || 'LOW',
        budget: data.budget || {},
        status: data.autonomyLevel && data.autonomyLevel >= 4 ? 'AWAITING_APPROVAL' : 'DRAFT',
      },
    });
    return task;
  }

  /**
   * Approve an agent task.
   */
  static async approveTask(taskId: string, approvedBy: string) {
    const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');
    if (task.status !== 'AWAITING_APPROVAL' && task.status !== 'DRAFT') {
      throw new Error(`Cannot approve task in status ${task.status}`);
    }

    return prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'APPROVED', approvedBy, approvedAt: new Date() },
    });
  }

  /**
   * Execute an approved task (simulate).
   */
  static async executeTask(taskId: string) {
    const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');
    if (task.status !== 'APPROVED' && task.status !== 'DRAFT') {
      throw new Error(`Cannot execute task in status ${task.status}`);
    }

    // Check safety constraints
    if (task.riskLevel === 'CRITICAL' && task.status !== 'APPROVED') {
      throw new Error('Critical-risk tasks require explicit approval');
    }

    await prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'EXECUTING', startedAt: new Date() },
    });

    // Simulate execution
    const result = {
      toolCallsUsed: 1,
      duration: 150,
      output: `${task.agentType} agent completed: ${task.purpose}`,
      affectedRecords: [],
    };

    return prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        result,
        completedAt: new Date(),
        rollbackInfo: { canRollback: task.riskLevel !== 'CRITICAL', steps: [] },
      },
    });
  }

  /**
   * Cancel a task.
   */
  static async cancelTask(taskId: string) {
    return prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
  }

  /**
   * Get tasks for a business.
   */
  static async getTasks(businessId: string, filters?: { status?: string; agentType?: string }) {
    return prisma.agentTask.findMany({
      where: {
        businessId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.agentType && { agentType: filters.agentType }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

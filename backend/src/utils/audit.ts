import { prisma } from '../db.js';
import { logger } from './logger.js';

interface AuditEventParams {
  actorUserId?: string;
  organizationId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  purpose?: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ERROR';
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Creates an immutable audit log entry in the database.
 * Crucial for Privacy + Audit requirements.
 */
export async function logAuditEvent(params: AuditEventParams) {
  try {
    await prisma.auditEvent.create({
      data: params
    });
  } catch (error) {
    // If DB auditing fails, fallback to standard logger immediately 
    // to ensure the security event isn't lost.
    logger.error('CRITICAL: Failed to write audit event to database', {
      error,
      auditParams: params
    });
  }
}

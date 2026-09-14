import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export interface ContextRequest {
  userId: string;
  requestedOrganizationId?: string;
  requestedBusinessId?: string;
  requestedRoleId?: string;
}

export interface UnifiedContext {
  user: {
    id: string;
    email: string;
    status: string;
  };
  activeRole: string | null;
  organization: {
    id: string;
    name: string;
    role: string;
  } | null;
  business: {
    id: string;
    displayName: string;
    status: string;
  } | null;
  journey: string;
  privacy: {
    dataSharingScope: string;
  };
  permissions: string[];
}

export class ContextService {
  /**
   * Resolves unified context securely, preventing IDOR and unauthorized access.
   */
  static async resolve(req: ContextRequest): Promise<UnifiedContext> {
    const { userId, requestedOrganizationId, requestedBusinessId, requestedRoleId } = req;

    // 1. Resolve User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        memberships: { include: { organization: true } },
        ownedBusinesses: true,
      }
    });

    if (!user) {
      throw new AppError('UNAUTHENTICATED: User not found', 401);
    }
    if (user.status === 'SUSPENDED') {
      throw new AppError('ACCOUNT_SUSPENDED: User account is suspended', 403);
    }

    // 2. Resolve Role
    let activeRole = null;
    if (requestedRoleId) {
      const hasRole = user.roles.find(r => r.roleId === requestedRoleId);
      if (!hasRole) {
        throw new AppError('ROLE_NOT_AVAILABLE: Unauthorized role context', 403);
      }
      activeRole = hasRole.role.name;
    } else if (user.roles.length > 0) {
      activeRole = user.roles[0].role.name;
    }

    // 3. Resolve Organization
    let activeOrganization = null;
    if (requestedOrganizationId) {
      const membership = user.memberships.find(m => m.organizationId === requestedOrganizationId);
      if (!membership) {
        throw new AppError('ORGANIZATION_NOT_FOUND: Unauthorized organization context', 403);
      }
      if (membership.organization.status === 'SUSPENDED') {
        throw new AppError('ORGANIZATION_SUSPENDED: Organization is suspended', 403);
      }
      activeOrganization = {
        id: membership.organizationId,
        name: membership.organization.name,
        role: membership.membershipRole
      };
    }

    // 4. Resolve Business
    let activeBusiness = null;
    if (requestedBusinessId) {
      // Must be owner or belong to the organization that owns it
      const business = await prisma.business.findUnique({
        where: { id: requestedBusinessId }
      });

      if (!business) {
        throw new AppError('BUSINESS_NOT_FOUND: Business not found', 404);
      }

      const isOwner = business.ownerUserId === userId;
      const isOrgMember = business.organizationId && user.memberships.some(m => m.organizationId === business.organizationId);
      
      if (!isOwner && !isOrgMember) {
        throw new AppError('FORBIDDEN: Unauthorized business context', 403);
      }

      if (business.businessStatus === 'SUSPENDED') {
        throw new AppError('BUSINESS_SUSPENDED: Business is suspended', 403);
      }

      activeBusiness = {
        id: business.id,
        displayName: business.displayName,
        status: business.businessStatus || 'ACTIVE'
      };
    } else if (user.ownedBusinesses.length > 0) {
      const b = user.ownedBusinesses[0];
      activeBusiness = {
        id: b.id,
        displayName: b.displayName,
        status: b.businessStatus || 'ACTIVE'
      };
    }

    // 5. Journey Context (Mock heuristic for now based on profile completion)
    const journey = activeBusiness ? 'GROW' : 'ONBOARDING';

    // 6. Security / Permissions
    const permissions: string[] = [];
    if (activeRole === 'ADMIN') permissions.push('ALL');
    if (activeBusiness) permissions.push('BUSINESS_READ', 'BUSINESS_WRITE');
    if (activeOrganization && activeOrganization.role === 'ADMIN') permissions.push('ORG_ADMIN');

    // 7. Audit Logging (Asynchronous)
    if (requestedBusinessId || requestedOrganizationId) {
      await prisma.auditEvent.create({
        data: {
          action: 'CONTEXT_SWITCH',
          resourceType: 'API_CONTEXT',
          actorUserId: user.id,
          organizationId: activeOrganization?.id,
          result: 'SUCCESS',
          ipAddress: 'internal',
        }
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        status: user.status || 'ACTIVE'
      },
      activeRole: activeRole || 'UNASSIGNED',
      organization: activeOrganization,
      business: activeBusiness,
      journey,
      privacy: {
        dataSharingScope: 'PRIVATE'
      },
      permissions
    };
  }
}

// ── User Types ────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profileImage: string | null;
  countryCode: string | null;
  timezone: string | null;
}

// ── Role Types ────────────────────────────────────

export type RoleCode =
  | 'ENTREPRENEUR'
  | 'INVESTOR'
  | 'MENTOR'
  | 'ADVISOR'
  | 'INCUBATOR'
  | 'ACCELERATOR'
  | 'GOVERNMENT'
  | 'CORPORATE'
  | 'STUDENT'
  | 'UNIVERSITY'
  | 'SERVICE_PROVIDER';

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  createdAt: Date;
}

// ── Organization Types ────────────────────────────

export type OrganizationStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

export interface Organization {
  id: string;
  name: string;
  countryCode: string | null;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  organizationId: string;
  userId: string;
  membershipRole: string;
  createdAt: Date;
}

// ── Business Types ────────────────────────────────

export interface Business {
  id: string;
  organizationId: string | null;
  ownerUserId: string | null;
  legalName: string | null;
  displayName: string;
  countryCode: string | null;
  businessStatus: string | null;
  foundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── Auth Types ────────────────────────────────────

export interface AuthTokenPayload {
  userId: string;
  email: string;
  roles: RoleCode[];
  iat?: number;
  exp?: number;
}

// ── API Response Types ────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ── Provenance Types ──────────────────────────────

export type ProvenanceType =
  | 'OFFICIAL_SOURCE'
  | 'VERIFIED'
  | 'CONNECTED_SOURCE'
  | 'PROFESSIONALLY_REVIEWED'
  | 'USER_REPORTED'
  | 'IMPORTED'
  | 'CALCULATED'
  | 'ESTIMATED'
  | 'AI_GENERATED'
  | 'UNVERIFIED';

export interface ProvenanceRecord {
  id: string;
  provenance: ProvenanceType;
  sourceName: string | null;
  sourceUrl: string | null;
  sourceReference: string | null;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// ── Audit Types ───────────────────────────────────

export interface AuditEvent {
  id: string;
  actorUserId: string | null;
  organizationId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  purpose: string | null;
  result: string;
  createdAt: Date;
}

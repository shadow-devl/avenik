/** All supported role codes in Avenik */
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
  description: string | null;
  createdAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  createdAt: string;
}

/** Role metadata for UI display */
export const ROLE_LABELS: Record<RoleCode, string> = {
  ENTREPRENEUR: 'Entrepreneur',
  INVESTOR: 'Investor',
  MENTOR: 'Mentor',
  ADVISOR: 'Advisor',
  INCUBATOR: 'Incubator',
  ACCELERATOR: 'Accelerator',
  GOVERNMENT: 'Government',
  CORPORATE: 'Corporate',
  STUDENT: 'Student',
  UNIVERSITY: 'University / Research',
  SERVICE_PROVIDER: 'Service Provider',
};

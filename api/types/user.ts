/** User status in the system */
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

/** Core user identity */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  countryCode: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** Extended user profile (separate from auth credentials) */
export interface UserProfile {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profileImage: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

/** User with profile and roles */
export interface UserWithDetails extends User {
  profile: UserProfile | null;
  roles: string[];
}

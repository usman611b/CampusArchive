import { UserRole, VerificationStatus } from '@campusarchive/shared';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  bio?: string;
  universityId?: string;
  universityName?: string;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  contributionScore: number;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  universityId?: string;
  universityName?: string;
  departmentId?: string;
  programId?: string;
}

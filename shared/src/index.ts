// Shared Types and Interfaces for CampusArchive

export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  ALUMNI = 'ALUMNI',
  FACULTY = 'FACULTY',
  MODERATOR = 'MODERATOR',
  ADMINISTRATOR = 'ADMINISTRATOR',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.GUEST]: 0,
  [UserRole.STUDENT]: 10,
  [UserRole.ALUMNI]: 10,
  [UserRole.FACULTY]: 20,
  [UserRole.MODERATOR]: 30,
  [UserRole.ADMINISTRATOR]: 40,
  [UserRole.SUPER_ADMIN]: 50
};

export enum Permission {
  // Student Permissions
  UPLOAD_RESOURCE = 'UPLOAD_RESOURCE',
  DOWNLOAD_RESOURCE = 'DOWNLOAD_RESOURCE',
  BOOKMARK_RESOURCE = 'BOOKMARK_RESOURCE',
  COMMENT_DISCUSSION = 'COMMENT_DISCUSSION',
  RATE_RESOURCE = 'RATE_RESOURCE',

  // Moderator Permissions
  MODERATE_RESOURCES = 'MODERATE_RESOURCES',
  MODERATE_DISCUSSIONS = 'MODERATE_DISCUSSIONS',
  RESOLVE_REPORTS = 'RESOLVE_REPORTS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',

  // Administrator Permissions
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ACADEMICS = 'MANAGE_ACADEMICS',
  SEND_ANNOUNCEMENTS = 'SEND_ANNOUNCEMENTS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',

  // Super Admin Only Permissions
  MANAGE_ADMINS = 'MANAGE_ADMINS',
  MODIFY_SECURITY = 'MODIFY_SECURITY',
  RESTORE_DELETED_USERS = 'RESTORE_DELETED_USERS'
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [Permission.DOWNLOAD_RESOURCE],
  [UserRole.STUDENT]: [
    Permission.UPLOAD_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
    Permission.BOOKMARK_RESOURCE,
    Permission.COMMENT_DISCUSSION,
    Permission.RATE_RESOURCE
  ],
  [UserRole.ALUMNI]: [
    Permission.UPLOAD_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
    Permission.BOOKMARK_RESOURCE,
    Permission.COMMENT_DISCUSSION,
    Permission.RATE_RESOURCE
  ],
  [UserRole.FACULTY]: [
    Permission.UPLOAD_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
    Permission.BOOKMARK_RESOURCE,
    Permission.COMMENT_DISCUSSION,
    Permission.RATE_RESOURCE,
    Permission.MODERATE_RESOURCES
  ],
  [UserRole.MODERATOR]: [
    Permission.UPLOAD_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
    Permission.BOOKMARK_RESOURCE,
    Permission.COMMENT_DISCUSSION,
    Permission.RATE_RESOURCE,
    Permission.MODERATE_RESOURCES,
    Permission.MODERATE_DISCUSSIONS,
    Permission.RESOLVE_REPORTS,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.ADMINISTRATOR]: [
    Permission.UPLOAD_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
    Permission.BOOKMARK_RESOURCE,
    Permission.COMMENT_DISCUSSION,
    Permission.RATE_RESOURCE,
    Permission.MODERATE_RESOURCES,
    Permission.MODERATE_DISCUSSIONS,
    Permission.RESOLVE_REPORTS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ACADEMICS,
    Permission.SEND_ANNOUNCEMENTS,
    Permission.VIEW_AUDIT_LOGS
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission)
};

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
  REJECTED = 'REJECTED'
}

export enum VisibilityType {
  PUBLIC = 'PUBLIC',
  UNIVERSITY_ONLY = 'UNIVERSITY_ONLY',
  DEPARTMENT_ONLY = 'DEPARTMENT_ONLY',
  PRIVATE = 'PRIVATE'
}

export enum ResourceStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  ARCHIVED = 'ARCHIVED'
}

export enum FileType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  PPTX = 'PPTX',
  TXT = 'TXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  ZIP = 'ZIP',
  GITHUB_REPO = 'GITHUB_REPO'
}

export enum CategoryType {
  EXAM_MIDTERM = 'EXAM_MIDTERM',
  EXAM_FINAL = 'EXAM_FINAL',
  LECTURE_NOTES = 'LECTURE_NOTES',
  LAB_REPORT = 'LAB_REPORT',
  HOMEWORK_SOLUTION = 'HOMEWORK_SOLUTION',
  SYLLABUS = 'SYLLABUS',
  RESEARCH_SUMMARY = 'RESEARCH_SUMMARY',
  OTHER = 'OTHER'
}

export interface UserDTO {
  id: string;
  universityId: string;
  departmentId?: string;
  programId?: string;
  email: string;
  fullName: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
  bio?: string;
  contributionScore: number;
  createdAt: string;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statusCode?: number;
}

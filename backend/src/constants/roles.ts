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

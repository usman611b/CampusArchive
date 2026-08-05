export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR';
  universityName: string;
  departmentId?: string;
  programId?: string;
  semesterId?: string;
  avatarUrl?: string;
  bio?: string;
  contributionScore: number;
  createdAt: string;
}

export class UserMapper {
  static toDto(userRow: any, karmaScore: number = 0): UserResponseDto {
    return {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.full_name,
      username: userRow.username,
      role: userRow.role || 'STUDENT',
      universityName: userRow.university_name || 'Lahore Garrison University',
      departmentId: userRow.department_id,
      programId: userRow.program_id,
      semesterId: userRow.semester_id,
      avatarUrl: userRow.avatar_url,
      bio: userRow.bio,
      contributionScore: karmaScore || userRow.contribution_score || 0,
      createdAt: userRow.created_at
    };
  }
}

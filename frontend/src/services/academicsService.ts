import { apiClient } from './apiClient';

export interface DepartmentApiItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  iconName: string;
  description: string;
  programsCount?: number;
  coursesCount?: number;
  resourcesCount: number;
  contributorsCount?: number;
  totalDownloads?: number;
  averageRating?: number | null;
}

export interface ProgramApiItem {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  code: string;
  totalSemesters: number;
  description: string;
}

export interface SemesterApiItem {
  id: string;
  programId: string;
  semesterNumber: number;
  title: string;
}

export interface CourseApiItem {
  id: string;
  programId: string;
  semesterId: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  instructorName: string;
  creditHours: number;
  sectionsCount: {
    notes: number;
    pastPapers: number;
    assignments: number;
    projects: number;
    books: number;
    videos: number;
    labManuals: number;
  };
  totalResources: number;
  totalDownloads: number;
  averageRating?: number | null;
  contributorsCount: number;
  enrolledStudentsCount?: number;
  semesterNumber?: number;
}

export interface CommentApiItem {
  id: string;
  userId: string;
  courseId: string;
  parentCommentId?: string | null;
  content: string;
  isHelpfulCount: number;
  createdAt: string;
  author: {
    fullName: string;
    username: string;
    avatarUrl?: string | null;
  };
}

export interface ResourceApiItem {
  id: string;
  uploaderId: string;
  courseId: string;
  categoryId: string;
  categoryName?: string;
  departmentName?: string;
  semesterName?: string;
  courseTitle?: string;
  title: string;
  description: string;
  fileStoragePath: string;
  fileType?: string;
  fileSizeFormatted?: string;
  status: string;
  createdAt: string;
  averageRating?: number;
  ratingCount?: number;
  commentsCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  tags?: string[];
  uploader?: {
    fullName: string;
    username: string;
  };
}

export interface ContributorApiItem {
  userId: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  uploadsCount: number;
  avgRating: number;
  karmaScore: number;
}

export class AcademicsService {
  static async getDepartments(): Promise<DepartmentApiItem[]> {
    const response = await apiClient.get('/academics/departments');
    return response.data.data.departments;
  }

  static async getPrograms(deptId: string): Promise<ProgramApiItem[]> {
    const response = await apiClient.get(`/academics/departments/${deptId}/programs`);
    return response.data.data.programs;
  }

  static async getSemesters(programId: string): Promise<SemesterApiItem[]> {
    const response = await apiClient.get(`/academics/programs/${programId}/semesters`);
    return response.data.data.semesters;
  }

  static async getCourses(programId: string, semesterId: string): Promise<CourseApiItem[]> {
    const response = await apiClient.get(`/academics/programs/${programId}/semesters/${semesterId}/courses`);
    return response.data.data.courses;
  }

  static async getCourseHub(courseId: string): Promise<CourseApiItem> {
    const response = await apiClient.get(`/academics/courses/${courseId}`);
    return response.data.data.course || response.data.data;
  }

  static async getCourseResources(courseId: string, category?: string): Promise<ResourceApiItem[]> {
    const url = category
      ? `/resources/course/${courseId}?category=${category}`
      : `/resources/course/${courseId}`;
    const response = await apiClient.get(url);
    return response.data.data.resources ?? [];
  }

  static async getCourseDiscussions(courseId: string): Promise<CommentApiItem[]> {
    const response = await apiClient.get(`/resources/course/${courseId}/comments`);
    return response.data.data.comments ?? [];
  }

  static async postCourseComment(courseId: string, content: string, parentCommentId?: string): Promise<CommentApiItem> {
    const response = await apiClient.post(`/resources/course/${courseId}/comments`, {
      courseId,
      content,
      parentCommentId: parentCommentId || null
    });
    return response.data.data.comment;
  }

  static async getCourseContributors(courseId: string): Promise<ContributorApiItem[]> {
    const response = await apiClient.get(`/resources/course/${courseId}/contributors`);
    return response.data.data.contributors ?? [];
  }
}

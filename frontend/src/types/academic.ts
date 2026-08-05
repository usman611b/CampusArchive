export interface Department {
  id: string;
  name: string;
  slug: string;
  code: string;
  iconName: string;
  description: string;
  programsCount: number;
  coursesCount?: number;
  resourcesCount: number;
  contributorsCount?: number;
  totalDownloads?: number;
  averageRating?: number | null;
}

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  code: string;
  totalSemesters: number;
  description: string;
}

export interface Course {
  id: string;
  programId: string;
  semesterId?: string;
  semesterNumber: number;
  code: string;
  title: string;
  slug: string;
  description: string;
  instructorName: string;
  creditHours: number;
  rating?: number;
  averageRating?: number | null;
  reviewsCount?: number;
  resourcesCount: number;
  totalResources?: number;
  totalDownloads?: number;
  enrolledStudentsCount?: number;
  contributorsCount?: number;
  sectionsCount: {
    notes: number;
    pastPapers: number;
    assignments: number;
    projects: number;
    books: number;
    labManuals: number;
    videos: number;
    discussion?: number;
  };
}

export type CourseSectionType =
  | 'overview'
  | 'notes'
  | 'past-papers'
  | 'assignments'
  | 'projects'
  | 'lab-manuals'
  | 'books'
  | 'videos'
  | 'discussion'
  | 'contributors'
  | 'statistics';

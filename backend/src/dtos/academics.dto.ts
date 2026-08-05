export interface DepartmentDto {
  id: string;
  name: string;
  slug: string;
  code: string;
  iconName: string;
  description: string;
  programsCount: number;
  coursesCount: number;
  resourcesCount: number;
  contributorsCount: number;
  totalDownloads: number;
  averageRating: number | null;
}

export interface ProgramDto {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  code: string;
  totalSemesters: number;
  description: string;
}

export interface SemesterDto {
  id: string;
  programId: string;
  semesterNumber: number;
  title: string;
}

export interface CourseDto {
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
  averageRating: number | null;
  contributorsCount: number;
}

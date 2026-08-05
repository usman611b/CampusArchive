import NodeCache from 'node-cache';
import { AcademicsRepository } from '../repositories/academics.repository';
import { DepartmentDto, ProgramDto, SemesterDto, CourseDto } from '../dtos/academics.dto';
import { supabase } from '../config/database';

// 60-Second TTL Cache for Academic Structure
const cache = new NodeCache({ stdTTL: 60 });

export class AcademicsService {
  static flushCache() {
    cache.flushAll();
  }

  static async getDepartments(): Promise<DepartmentDto[]> {
    const cacheKey = 'departments_list_v2';
    const cached = cache.get<DepartmentDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await AcademicsRepository.getAllDepartments();

    // Fetch dynamic aggregate stats for each department in parallel
    const result: DepartmentDto[] = await Promise.all(
      rows.map(async (row) => {
        // 1. Programs count
        const { data: progs } = await supabase
          .from('programs')
          .select('id')
          .eq('department_id', row.id)
          .is('deleted_at', null);

        const progIds = (progs || []).map((p) => p.id);
        const programsCount = progIds.length;

        // 2. Courses count
        let coursesCount = 0;
        let courseIds: string[] = [];
        if (progIds.length > 0) {
          const { data: crs } = await supabase
            .from('courses')
            .select('id')
            .in('program_id', progIds)
            .is('deleted_at', null);
          courseIds = (crs || []).map((c) => c.id);
          coursesCount = courseIds.length;
        }

        // 3. Approved Resources & Contributors
        let resourcesCount = 0;
        let contributorsCount = 0;
        let totalDownloads = 0;
        let averageRating: number | null = null;

        if (courseIds.length > 0) {
          const { data: resRows } = await supabase
            .from('resources')
            .select('id, uploader_id')
            .in('course_id', courseIds)
            .eq('status', 'APPROVED')
            .is('deleted_at', null);

          const resources = resRows || [];
          resourcesCount = resources.length;

          const uploaderIds = [
            ...new Set(resources.map((r: any) => r.uploader_id).filter(Boolean))
          ];
          contributorsCount = uploaderIds.length;

          const resourceIds = resources.map((r: any) => r.id);
          if (resourceIds.length > 0) {
            const { data: analytics } = await supabase
              .from('resource_analytics')
              .select('downloads_count, rating_avg')
              .in('resource_id', resourceIds);

            if (analytics && analytics.length > 0) {
              totalDownloads = analytics.reduce(
                (sum, a: any) => sum + (a.downloads_count || 0),
                0
              );
              const validRatings = analytics
                .map((a: any) => parseFloat(a.rating_avg || '0'))
                .filter((r) => r > 0);

              if (validRatings.length > 0) {
                const sum = validRatings.reduce((acc, val) => acc + val, 0);
                averageRating = Math.round((sum / validRatings.length) * 10) / 10;
              }
            }
          }
        }

        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          code: row.code,
          iconName: row.icon_name || 'BookOpen',
          description: row.description || '',
          programsCount,
          coursesCount,
          resourcesCount,
          contributorsCount,
          totalDownloads,
          averageRating
        };
      })
    );

    cache.set(cacheKey, result);
    return result;
  }

  static async getPrograms(deptId: string): Promise<ProgramDto[]> {
    const cacheKey = `programs_${deptId}`;
    const cached = cache.get<ProgramDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await AcademicsRepository.getProgramsByDepartment(deptId);
    const result: ProgramDto[] = rows.map((row) => ({
      id: row.id,
      departmentId: row.department_id,
      name: row.name,
      slug: row.slug,
      code: row.code,
      totalSemesters: row.total_semesters || 8,
      description: row.description || ''
    }));

    cache.set(cacheKey, result);
    return result;
  }

  static async getSemesters(programId: string): Promise<SemesterDto[]> {
    const cacheKey = `semesters_${programId}`;
    const cached = cache.get<SemesterDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await AcademicsRepository.getSemestersByProgram(programId);
    const result: SemesterDto[] = rows.map((row) => ({
      id: row.id,
      programId: row.program_id,
      semesterNumber: row.semester_number,
      title: row.title
    }));

    cache.set(cacheKey, result);
    return result;
  }

  static async getCourses(programId: string, semesterId: string): Promise<CourseDto[]> {
    const cacheKey = `courses_${programId}_${semesterId}`;
    const cached = cache.get<CourseDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await AcademicsRepository.getCoursesBySemester(programId, semesterId);

    // Build real stats per course from the database
    const result: CourseDto[] = await Promise.all(rows.map(async (row) => {
      // Count resources by category for this course
      const { data: resourceRows } = await supabase
        .from('resources')
        .select('id, category_id, categories(slug)')
        .eq('course_id', row.id)
        .eq('status', 'APPROVED')
        .is('deleted_at', null);

      const resources = resourceRows || [];
      const totalResources = resources.length;

      // Count by category slug
      const categoryCounts: Record<string, number> = {};
      resources.forEach((r: any) => {
        const slug = r.categories?.slug || 'other';
        categoryCounts[slug] = (categoryCounts[slug] || 0) + 1;
      });

      // Get aggregate analytics
      const resourceIds = resources.map((r: any) => r.id);
      let totalDownloads = 0;
      let averageRating: number | null = null;

      if (resourceIds.length > 0) {
        const { data: analyticsRows } = await supabase
          .from('resource_analytics')
          .select('downloads_count, rating_avg')
          .in('resource_id', resourceIds);

        if (analyticsRows && analyticsRows.length > 0) {
          totalDownloads = analyticsRows.reduce((sum: number, a: any) => sum + (a.downloads_count || 0), 0);
          const validRatings = analyticsRows.filter((a: any) => parseFloat(a.rating_avg || '0') > 0);
          if (validRatings.length > 0) {
            const rawAvg = validRatings.reduce((sum: number, a: any) => sum + parseFloat(a.rating_avg || '0'), 0) / validRatings.length;
            averageRating = Math.round(rawAvg * 10) / 10;
          }
        }
      }

      // Count distinct contributors
      const uploaderIds = [...new Set(resources.map((r: any) => r.uploader_id).filter(Boolean))];

      return {
        id: row.id,
        programId: row.program_id,
        semesterId: row.semester_id,
        code: row.code,
        title: row.title,
        slug: row.slug,
        description: row.description || '',
        instructorName: row.instructor_name || 'Department Faculty',
        creditHours: row.credit_hours || 3,
        sectionsCount: {
          notes: categoryCounts['lecture-notes'] || 0,
          pastPapers: categoryCounts['past-papers'] || 0,
          assignments: categoryCounts['assignments'] || 0,
          projects: categoryCounts['projects'] || 0,
          books: categoryCounts['textbooks'] || 0,
          videos: categoryCounts['video-tutorials'] || 0,
          labManuals: categoryCounts['lab-manuals'] || 0
        },
        totalResources,
        totalDownloads,
        averageRating,
        contributorsCount: uploaderIds.length
      };
    }));

    cache.set(cacheKey, result);
    return result;
  }

  static async getCourseHubDetails(courseId: string) {
    const course = await AcademicsRepository.getCourseById(courseId);
    if (!course) throw new Error('COURSE_NOT_FOUND: Course not found.');
    const chapters = await AcademicsRepository.getChaptersByCourse(courseId);
    return { course, chapters };
  }
}

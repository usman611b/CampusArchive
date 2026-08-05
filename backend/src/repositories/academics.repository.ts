import { supabase } from '../config/database';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AcademicsRepository {
  static async getAllDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getProgramsByDepartment(deptId: string) {
    if (!deptId || !UUID_REGEX.test(deptId)) return [];

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('department_id', deptId)
      .is('deleted_at', null)
      .order('code', { ascending: true });

    if (error) {
      if (error.code === '22P02') return [];
      throw error;
    }
    return data || [];
  }

  static async getSemestersByProgram(programId: string) {
    if (!programId || !UUID_REGEX.test(programId)) return [];

    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('program_id', programId)
      .order('semester_number', { ascending: true });

    if (error) {
      if (error.code === '22P02') return [];
      throw error;
    }
    return data || [];
  }

  static async getCoursesBySemester(programId: string, semesterId: string) {
    if (!programId || !semesterId || !UUID_REGEX.test(programId) || !UUID_REGEX.test(semesterId)) return [];

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('program_id', programId)
      .eq('semester_id', semesterId)
      .is('deleted_at', null)
      .order('code', { ascending: true });

    if (error) {
      if (error.code === '22P02') return [];
      throw error;
    }
    return data || [];
  }

  static async getCourseById(courseId: string) {
    if (!courseId || !UUID_REGEX.test(courseId)) return null;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getChaptersByCourse(courseId: string) {
    if (!courseId || !UUID_REGEX.test(courseId)) return [];

    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('chapter_no', { ascending: true });

    if (error) return [];
    return data || [];
  }
}

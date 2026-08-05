import { Router } from 'express';
import { supabase } from '../config/database';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { ResourceMapper } from '../dtos/resource.dto';

const router = Router();

/**
 * GET /api/v1/search?q=&category=&department=&semester=&sort=latest&page=1&limit=20
 * Global full-text + filter search across resources
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      q = '',
      category,
      department,
      semester,
      sort = 'latest',
      page = '1',
      limit = '20'
    } = req.query as Record<string, string>;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('resources')
      .select(`
        id, title, description, created_at, status, uploader_id, course_id, category_id, file_storage_path, file_hash, version,
        categories(id, name, slug),
        users!resources_uploader_id_fkey(full_name, username, avatar_url),
        course:courses(id, code, title,
          semesters:semesters(semester_number, title),
          programs:programs(code, name, departments(id, name, code, slug))
        ),
        resource_analytics(*),
        storage_metadata(*),
        resource_tags(tags(id, name, slug))
      `, { count: 'exact' })
      .eq('status', 'APPROVED')
      .is('deleted_at', null);

    // Department + Semester Filter via Academic Hierarchy
    if (department && department !== 'ALL') {
      const { data: matchedDepts } = await supabase
        .from('departments')
        .select('id')
        .or(`id.eq.${department},slug.eq.${department},code.ilike.%${department}%,name.ilike.%${department}%`);

      const deptIds = (matchedDepts || []).map((d) => d.id);
      if (deptIds.length > 0) {
        const { data: matchedProgs } = await supabase
          .from('programs')
          .select('id')
          .in('department_id', deptIds);

        const progIds = (matchedProgs || []).map((p) => p.id);
        if (progIds.length > 0) {
          let courseQuery = supabase.from('courses').select('id').in('program_id', progIds);

          if (semester && semester !== 'ALL') {
            const semNum = parseInt(semester);
            if (!isNaN(semNum)) {
              const { data: matchedSems } = await supabase
                .from('semesters')
                .select('id')
                .in('program_id', progIds)
                .eq('semester_number', semNum);
              const semIds = (matchedSems || []).map((s) => s.id);
              if (semIds.length > 0) {
                courseQuery = courseQuery.in('semester_id', semIds);
              }
            } else {
              courseQuery = courseQuery.eq('semester_id', semester);
            }
          }

          const { data: matchedCourses } = await courseQuery;
          const courseIds = (matchedCourses || []).map((c) => c.id);
          if (courseIds.length > 0) {
            query = query.in('course_id', courseIds);
          } else {
            return res.status(200).json({
              success: true,
              message: 'Search results retrieved.',
              data: { resources: [], total: 0, page: parseInt(page), limit: parseInt(limit) }
            });
          }
        }
      }
    }

    // Full-text search on title + description
    if (q.trim()) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Category filter by slug
    if (category && category !== 'ALL') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    // Sorting
    if (sort === 'rating') {
      query = query.order('average_rating', { ascending: false });
    } else if (sort === 'downloads') {
      query = query.order('downloads_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: resources, error, count } = await query;
    if (error) throw new Error(error.message);

    const dtoResources = (resources || []).map((r: any) => ResourceMapper.toDto(r));

    return res.status(200).json({
      success: true,
      message: 'Search results retrieved.',
      data: {
        resources: dtoResources,
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/search/categories
 * Return all distinct resource categories from DB
 */
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    if (error) throw new Error(error.message);
    return res.status(200).json({ success: true, message: 'Categories fetched.', data: { categories: data || [] } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/search/departments
 * Return all departments for filter dropdown
 */
router.get('/departments', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, slug')
      .order('name');
    if (error) throw new Error(error.message);
    return res.status(200).json({ success: true, message: 'Departments fetched.', data: { departments: data || [] } });
  } catch (error) {
    next(error);
  }
});

export default router;

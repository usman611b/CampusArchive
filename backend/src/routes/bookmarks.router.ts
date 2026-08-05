import { Router } from 'express';
import { supabase } from '../config/database';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { ResourceMapper } from '../dtos/resource.dto';

const router = Router();

/**
 * GET /api/v1/bookmarks
 * Fetch all bookmarks for the authenticated user with full resource details
 */
router.get('/', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id, created_at,
        resource:resources!inner(
          *,
          users!resources_uploader_id_fkey(full_name, username, avatar_url),
          categories(id, name, slug),
          course:courses(id, code, title, semesters(semester_number, title), programs(code, name, departments(id, name, code, slug))),
          resource_analytics(*),
          storage_metadata(*),
          resource_tags(tags(id, name, slug))
        )
      `)
      .eq('user_id', userId)
      .is('resource.deleted_at', null)
      .eq('resource.status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const bookmarks = (data || []).map((b: any) => ({
      bookmarkId: b.id,
      savedAt: b.created_at,
      ...ResourceMapper.toDto(b.resource)
    }));

    return res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved.',
      data: { bookmarks }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/bookmarks/ids
 * Return only bookmarked resource IDs for the authenticated user (lightweight check)
 */
router.get('/ids', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        resource_id,
        resource:resources!inner(id, status, deleted_at)
      `)
      .eq('user_id', userId)
      .is('resource.deleted_at', null)
      .eq('resource.status', 'APPROVED');

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      message: 'Bookmark IDs retrieved.',
      data: { ids: (data || []).map((b: any) => b.resource_id) }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

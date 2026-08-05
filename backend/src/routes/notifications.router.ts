import { Router } from 'express';
import { supabase } from '../config/database';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/v1/notifications
 * Fetch authenticated user's notifications (newest first)
 */
router.get('/', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved.',
      data: { notifications: data || [] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/notifications/mark-all-read
 * Mark all unread notifications as read for the user
 */
router.patch('/mark-all-read', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      data: null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return res.status(200).json({ success: true, message: 'Notification marked as read.', data: null });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/notifications/clear-all
 * Delete all notifications for the user
 */
router.delete('/clear-all', authenticateJwt, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return res.status(200).json({ success: true, message: 'All notifications cleared.', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AnalyticsService } from '../services/analytics.service';
import { AcademicsService } from '../services/academics.service';
import { ResourceMapper } from '../dtos/resource.dto';

async function logAudit(adminId: string, action: string, targetType: string, targetId: string, details?: any) {
  try {
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || null
    });
  } catch (e) {
    // Suppress audit failure to prevent blocking primary transactions
  }
}

export class AdminController {

  // ── Platform Analytics ────────────────────────────────────────────────────

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        { count: totalUsers },
        { count: totalResources },
        { count: pendingResources },
        { count: approvedResources },
        { count: totalDownloads },
        { data: topContributors }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('resources').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'PENDING').is('deleted_at', null),
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED').is('deleted_at', null),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase
          .from('contributor_metrics')
          .select('user_id, uploads_count, karma_score, avg_rating, user:users(full_name, username, avatar_url)')
          .order('karma_score', { ascending: false })
          .limit(5)
      ]);

      return res.status(200).json({
        success: true,
        message: 'Platform analytics retrieved.',
        data: {
          totalUsers: totalUsers || 0,
          totalResources: totalResources || 0,
          pendingResources: pendingResources || 0,
          approvedResources: approvedResources || 0,
          totalDownloads: totalDownloads || 0,
          topContributors: (topContributors || []).map((c: any) => ({
            userId: c.user_id,
            fullName: c.user?.full_name || 'Anonymous',
            username: c.user?.username || 'anon',
            avatarUrl: c.user?.avatar_url || null,
            uploadsCount: c.uploads_count,
            karmaScore: c.karma_score,
            avgRating: c.avg_rating
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Resource Moderation Queue ──────────────────────────────────────────────

  static async getModerationQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      let query = supabase
        .from('resources')
        .select(`
          id, title, description, status, created_at,
          *,
          users!resources_uploader_id_fkey(id, full_name, email, username, avatar_url),
          categories(id, name, slug),
          course:courses(id, code, title, semesters(semester_number, title), programs(code, name, departments(id, name, code, slug))),
          resource_analytics(*),
          storage_metadata(*),
          resource_tags(tags(id, name, slug))
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (status && typeof status === 'string' && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        query = query.eq('status', status);
      } else if (status !== 'ALL') {
        query = query.eq('status', 'PENDING');
      }

      const { data, error } = await query;
      if (error) throw error;

      const dtoResources = (data || []).map((r: any) => ResourceMapper.toDto(r));

      return res.status(200).json({
        success: true,
        message: 'Resources moderation queue retrieved.',
        data: { pendingResources: dtoResources }
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const { data, error } = await supabase
        .from('resources')
        .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, title, uploader_id')
        .single();

      if (error) throw error;

      await supabase.from('moderation_logs').insert({
        resource_id: id,
        admin_id: adminId,
        action: 'APPROVE',
        reason: 'Content verified against academic guidelines.'
      });

      await supabase.from('notifications').insert({
        user_id: data.uploader_id,
        type: 'APPROVAL',
        title: 'Resource Approved & Published!',
        description: `Your resource "${data.title}" has been approved by a moderator and is live in the Course Hub.`,
        is_read: false
      });

      await logAudit(adminId, 'RESOURCE_APPROVED', 'resource', id, { title: data.title });

      if (data?.uploader_id) {
        AnalyticsService.recalculateKarma(data.uploader_id).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        message: 'Resource approved and published.',
        data: { resource: data }
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const { reason } = req.body;

      const { data, error } = await supabase
        .from('resources')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, title, uploader_id')
        .single();

      if (error) throw error;

      const rejectionReason = reason || 'Does not meet academic publishing quality standards.';

      await supabase.from('moderation_logs').insert({
        resource_id: id,
        admin_id: adminId,
        action: 'REJECT',
        reason: rejectionReason
      });

      await supabase.from('notifications').insert({
        user_id: data.uploader_id,
        type: 'REJECTION',
        title: 'Resource Rejected by Moderator',
        description: `Your resource "${data.title}" was not approved. Reason: ${rejectionReason}`,
        is_read: false
      });

      await logAudit(adminId, 'RESOURCE_REJECTED', 'resource', id, { title: data.title, reason: rejectionReason });

      return res.status(200).json({
        success: true,
        message: 'Resource rejected.',
        data: { resource: data }
      });
    } catch (error) {
      next(error);
    }
  }

  static async featureResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const { data, error } = await supabase
        .from('resources')
        .update({ is_featured: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, title')
        .single();

      if (error) throw error;

      await logAudit(adminId, 'RESOURCE_FEATURED', 'resource', id, { title: data.title });

      return res.status(200).json({ success: true, message: 'Resource featured.', data: { resource: data } });
    } catch (error) {
      next(error);
    }
  }

  // ── User Management ────────────────────────────────────────────────────────

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { q = '', role, status, page = '1', limit = '20' } = req.query as Record<string, string>;
      const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
      const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));
      const safeSearch = q.trim().slice(0, 100).replace(/[,%()]/g, ' ');
      const offset = (safePage - 1) * safeLimit;

      let query = supabase
        .from('users')
        .select('id, full_name, username, email, role, is_suspended, deleted_at, created_at, avatar_url, university_name', { count: 'exact' });

      if (safeSearch) {
        query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,username.ilike.%${safeSearch}%`);
      }
      if (role && role !== 'ALL') query = query.eq('role', role);
      if (status === 'suspended') query = query.eq('is_suspended', true).is('deleted_at', null);
      if (status === 'active') query = query.eq('is_suspended', false).is('deleted_at', null);

      query = query.order('created_at', { ascending: false }).range(offset, offset + safeLimit - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Users retrieved.',
        data: { users: data || [], total: count || 0, page: safePage, limit: safeLimit }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { data: user, error } = await supabase
        .from('users')
        .select('id, full_name, username, email, role, is_suspended, deleted_at, created_at, avatar_url, university_name, bio')
        .eq('id', id)
        .single();

      if (error) throw error;

      const { count: uploadsCount } = await supabase
        .from('resources')
        .select('id', { count: 'exact' })
        .eq('uploader_id', id)
        .is('deleted_at', null);

      return res.status(200).json({
        success: true,
        message: 'User profile retrieved.',
        data: {
          user: {
            id: user.id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role,
            isSuspended: !!user.is_suspended,
            createdAt: user.created_at,
            avatarUrl: user.avatar_url,
            universityName: user.university_name,
            bio: user.bio,
            uploadsCount: uploadsCount || 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user!.id;
      const requesterRole = req.user!.role as string;

      if (!['STUDENT', 'MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.', data: null });
      }

      if (role === 'SUPER_ADMIN' && requesterRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden. Only Super Admins can promote users to Super Admin.', data: null });
      }

      const { data: existingUser } = await supabase.from('users').select('role').eq('id', id).single();
      if (existingUser?.role === 'SUPER_ADMIN' && requesterRole !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden. Super Admin roles can only be modified by a Super Admin.', data: null });
      }

      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await logAudit(adminId, 'USER_ROLE_CHANGED', 'user', id, { newRole: role, previousRole: existingUser?.role });

      return res.status(200).json({ success: true, message: `User role updated to ${role}.`, data: null });
    } catch (error) {
      next(error);
    }
  }

  static async changeUserRole(req: Request, res: Response, next: NextFunction) {
    return AdminController.updateUserRole(req, res, next);
  }

  static async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;
      const requesterRole = req.user!.role as string;

      const { data: targetUser } = await supabase.from('users').select('role').eq('id', id).single();
      if (targetUser && ['SUPER_ADMIN', 'ADMINISTRATOR'].includes(targetUser.role) && requesterRole !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Administrator accounts can only be suspended by a Super Admin.',
          data: null
        });
      }

      const { error } = await supabase
        .from('users')
        .update({ is_suspended: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: id,
        type: 'SYSTEM',
        title: 'Account Suspended',
        description: `Your account has been suspended by an administrator. Reason: ${reason || 'Violation of platform guidelines.'}`,
        is_read: false
      });

      await logAudit(adminId, 'USER_SUSPENDED', 'user', id, { reason });

      return res.status(200).json({ success: true, message: 'User suspended.', data: null });
    } catch (error) {
      next(error);
    }
  }

  static async restoreUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const { error } = await supabase
        .from('users')
        .update({ is_suspended: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await logAudit(adminId, 'USER_RESTORED', 'user', id, {});

      return res.status(200).json({ success: true, message: 'User account restored.', data: null });
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;
      const requesterRole = req.user!.role as string;

      const { data: targetUser } = await supabase.from('users').select('role').eq('id', id).single();
      if (targetUser && targetUser.role === 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden. Super Admin accounts cannot be deleted.', data: null });
      }

      const { error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await logAudit(adminId, 'USER_SOFT_DELETED', 'user', id, {});

      return res.status(200).json({ success: true, message: 'User soft-deleted.', data: null });
    } catch (error) {
      next(error);
    }
  }

  // ── Audit Logs ─────────────────────────────────────────────────────────────

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '30' } = req.query as Record<string, string>;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { data, error, count } = await supabase
        .from('audit_logs')
        .select(`
          id, action, target_type, target_id, details, created_at,
          admin:users(id, full_name, username, role)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) {
        const { data: modLogs, error: modError } = await supabase
          .from('moderation_logs')
          .select(`
            id, action, reason, created_at,
            admin:users(full_name, username),
            resource:resources(title)
          `)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (modError) throw modError;

        return res.status(200).json({
          success: true,
          message: 'Moderation audit logs retrieved.',
          data: { auditLogs: modLogs || [], total: modLogs?.length || 0 }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'System audit logs retrieved.',
        data: { auditLogs: data || [], total: count || 0 }
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Announcements ──────────────────────────────────────────────────────────

  static async sendAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { title, message, targetRole } = req.body;

      if (!title?.trim() || !message?.trim()) {
        return res.status(400).json({ success: false, message: 'Title and message are required.', data: null });
      }

      let userQuery = supabase.from('users').select('id').is('deleted_at', null);
      if (targetRole && targetRole !== 'ALL') {
        userQuery = userQuery.eq('role', targetRole);
      }

      const { data: users, error: userQueryError } = await userQuery;
      if (userQueryError) throw new Error(userQueryError.message);
      if (!users || users.length === 0) {
        return res.status(200).json({ success: true, message: 'No users to notify.', data: { notified: 0 } });
      }

      const notifications = users.map((u: any) => ({
        user_id: u.id,
        type: 'SYSTEM',
        title,
        description: message,
        is_read: false
      }));

      for (let i = 0; i < notifications.length; i += 500) {
        await supabase.from('notifications').insert(notifications.slice(i, i + 500));
      }

      await logAudit(adminId, 'ANNOUNCEMENT_SENT', 'platform', 'global', { title, targetRole, notified: users.length });

      return res.status(201).json({
        success: true,
        message: `Announcement sent to ${users.length} users.`,
        data: { notified: users.length }
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin: Hard Soft-Delete Any Resource ──────────────────────────────────

  static async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.id;
      const { id } = req.params;
      const { reason } = req.body;

      // Fetch resource metadata before deletion (for notification)
      const { data: resource, error: fetchErr } = await supabase
        .from('resources')
        .select('id, title, uploader_id')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (fetchErr || !resource) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      // Soft-delete
      const { error: delErr } = await supabase
        .from('resources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (delErr) throw new Error(delErr.message);

      AcademicsService.flushCache();

      // Write audit log
      await logAudit(adminId, 'RESOURCE_DELETED', 'resource', id, {
        title: resource.title,
        reason: reason || 'Removed by administrator'
      });

      // Notify the uploader
      if (resource.uploader_id && resource.uploader_id !== adminId) {
        await supabase.from('notifications').insert({
          user_id: resource.uploader_id,
          type: 'REJECTION',
          title: 'Your resource was removed',
          description: `Your upload "${resource.title}" was removed by an administrator. Reason: ${reason || 'Content policy violation or duplicate resource.'}`,
          is_read: false
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Resource deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}

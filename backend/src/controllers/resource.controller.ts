import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resource.service';
import { AcademicsService } from '../services/academics.service';
import { createPreSignedUrlSchema, createResourceSchema, rateResourceSchema } from '../validators/resource.validator';
import { ResourceMapper } from '../dtos/resource.dto';
import { supabase } from '../config/database';
import { InteractionService } from '../services/interaction.service';
import sanitizeHtml from 'sanitize-html';

const cleanPlainText = (value: string) => sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} }).trim();

export class ResourceController {
  static async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createPreSignedUrlSchema.parse(req.body);
      const data = await ResourceService.generateUploadUrl(req.user!.id, validatedInput);
      return res.status(200).json({
        success: true,
        message: 'Pre-signed upload URL generated successfully.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const uploaderId = req.user!.id;
      const validatedInput = createResourceSchema.parse(req.body);
      const resource = await ResourceService.createResource(uploaderId, validatedInput);
      return res.status(201).json({
        success: true,
        message: 'Resource created and queued for moderation.',
        data: { resource }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyUploads(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { data: resources, error } = await supabase
        .from('resources')
        .select(`
          *,
          users!resources_uploader_id_fkey(full_name, username, avatar_url),
          categories(id, name, slug),
          course:courses(id, code, title, semesters(semester_number, title), programs(code, name, departments(id, name, code, slug))),
          resource_analytics(*),
          storage_metadata(*),
          resource_tags(tags(id, name, slug))
        `)
        .eq('uploader_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      const dtoResources = (resources || []).map((r: any) => ResourceMapper.toDto(r));

      return res.status(200).json({
        success: true,
        message: 'Your uploads retrieved.',
        data: { resources: dtoResources }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const { category } = req.query;
      let resources = await ResourceService.getCourseResources(courseId);
      if (category && typeof category === 'string') {
        resources = resources.filter((resource) => resource.categoryName && resource.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === category);
      }

      return res.status(200).json({
        success: true,
        message: 'Resources retrieved successfully.',
        data: { resources }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getResourceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const ipAddress = req.ip;
      const resource = await ResourceService.getResourceDetail(id, userId, req.user?.role as string | undefined, ipAddress);
      return res.status(200).json({
        success: true,
        message: 'Resource detail retrieved.',
        data: { resource }
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const ipAddress = req.ip;
      const deviceInfo = req.headers['user-agent'];
      const downloadData = await ResourceService.downloadResource(id, userId, req.user!.role as string, ipAddress, deviceInfo);
      return res.status(200).json({
        success: true,
        message: 'Download audit logged.',
        data: downloadData
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const result = await ResourceService.toggleBookmark(userId, id);
      return res.status(200).json({
        success: true,
        message: result.isBookmarked ? 'Bookmark saved.' : 'Bookmark removed.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async rateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const validatedInput = rateResourceSchema.parse(req.body);
      const current = await InteractionService.getRatings(id, userId);
      const existing = current.ratings.find((rating) => rating.user_id === userId);
      const result = existing
        ? await InteractionService.updateRating(userId, req.user!.role as string, existing.id, validatedInput.stars)
        : await InteractionService.createRating(userId, id, validatedInput.stars);
      return res.status(200).json({
        success: true,
        message: 'Rating submitted successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Discussion / Q&A Comments ──────────────────────────────────────────

  static async getCourseComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          id, content, is_helpful_count, created_at, parent_comment_id,
          user:users(id, full_name, username, avatar_url)
        `)
        .eq('course_id', courseId)
        .is('parent_comment_id', null)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw new Error(error.message);

      const mapped = (comments || []).map((c: any) => ({
        id: c.id,
        userId: c.user?.id,
        courseId,
        content: c.content,
        isHelpfulCount: c.is_helpful_count,
        createdAt: c.created_at,
        parentCommentId: c.parent_comment_id,
        author: {
          fullName: c.user?.full_name || 'Anonymous',
          username: c.user?.username || 'anon',
          avatarUrl: c.user?.avatar_url || null
        }
      }));

      return res.status(200).json({
        success: true,
        message: 'Comments retrieved.',
        data: { comments: mapped }
      });
    } catch (error) {
      next(error);
    }
  }

  static async postCourseComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { courseId } = req.params;
      const { content, parentCommentId } = req.body;

      if (typeof content !== 'string') {
        return res.status(400).json({ success: false, message: 'Comment content is required.', data: null });
      }

      const safeContent = cleanPlainText(content);
      if (!safeContent || safeContent.length > 2000) {
        return res.status(400).json({ success: false, message: 'Comment must contain 1 to 2000 plain-text characters.', data: null });
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          course_id: courseId,
          content: safeContent,
          parent_comment_id: parentCommentId || null
        })
        .select(`
          id, content, is_helpful_count, created_at,
          user:users(id, full_name, username, avatar_url)
        `)
        .single();

      if (error) throw new Error(error.message);

      return res.status(201).json({
        success: true,
        message: 'Comment posted successfully.',
        data: {
          comment: {
            id: comment.id,
            userId,
            courseId,
            content: comment.content,
            isHelpfulCount: comment.is_helpful_count,
            createdAt: comment.created_at,
            author: {
              fullName: (comment as any).user?.full_name || 'Anonymous',
              username: (comment as any).user?.username || 'anon',
              avatarUrl: (comment as any).user?.avatar_url || null
            }
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Course Contributors ────────────────────────────────────────────────

  static async getCourseContributors(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const { data, error } = await supabase
        .from('resources')
        .select('uploader_id')
        .eq('course_id', courseId)
        .eq('status', 'APPROVED');

      if (error) throw new Error(error.message);

      const uploaderIds = [...new Set((data || []).map((r: any) => r.uploader_id))];

      if (uploaderIds.length === 0) {
        return res.status(200).json({ success: true, message: 'No contributors yet.', data: { contributors: [] } });
      }

      const { data: metrics, error: metricsError } = await supabase
        .from('contributor_metrics')
        .select(`
          user_id, uploads_count, avg_rating, karma_score,
          user:users(full_name, username, avatar_url)
        `)
        .in('user_id', uploaderIds)
        .order('karma_score', { ascending: false })
        .limit(10);

      if (metricsError) throw new Error(metricsError.message);

      const contributors = (metrics || []).map((m: any) => ({
        userId: m.user_id,
        fullName: m.user?.full_name || 'Anonymous',
        username: m.user?.username || 'anon',
        avatarUrl: m.user?.avatar_url || null,
        uploadsCount: m.uploads_count,
        avgRating: m.avg_rating,
        karmaScore: m.karma_score
      }));

      return res.status(200).json({
        success: true,
        message: 'Course contributors retrieved.',
        data: { contributors }
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Student: Delete Own Upload ─────────────────────────────────────────

  static async deleteMyResource(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Verify ownership — only soft-delete if uploader_id matches
      const { data: resource, error: fetchErr } = await supabase
        .from('resources')
        .select('id, title, uploader_id')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (fetchErr || !resource) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      if (resource.uploader_id !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own uploads.' });
      }

      const { error: delErr } = await supabase
        .from('resources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('uploader_id', userId); // Double-guard at DB level

      if (delErr) throw new Error(delErr.message);

      AcademicsService.flushCache();

      return res.status(200).json({
        success: true,
        message: 'Your upload has been deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
}

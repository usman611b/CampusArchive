import sanitizeHtml from 'sanitize-html';
import { supabase } from '../config/database';
import { AnalyticsService } from './analytics.service';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/customErrors';

const clean = (content: string) => sanitizeHtml(content.trim(), { allowedTags: [], allowedAttributes: {} }).trim();
const moderatorRoles = new Set(['MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN']);

export class InteractionService {
  private static async approvedResource(resourceId: string) {
    const { data, error } = await supabase.from('resources').select('id, uploader_id, comments_locked')
      .eq('id', resourceId).eq('status', 'APPROVED').is('deleted_at', null).maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundError('Approved resource not found.');
    return data;
  }

  private static async refreshResource(resourceId: string) {
    const [{ data: ratings }, { count: commentsCount }] = await Promise.all([
      supabase.from('resource_ratings').select('rating').eq('resource_id', resourceId),
      supabase.from('resource_comments').select('id', { count: 'exact', head: true })
        .eq('resource_id', resourceId).is('deleted_at', null)
    ]);
    const ratingCount = ratings?.length || 0;
    const averageRating = ratingCount ? ratings!.reduce((sum, row) => sum + row.rating, 0) / ratingCount : 0;
    await supabase.from('resource_analytics').upsert({
      resource_id: resourceId,
      rating_avg: Number(averageRating.toFixed(2)),
      rating_count: ratingCount,
      comments_count: commentsCount || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'resource_id' });
    return { averageRating: Number(averageRating.toFixed(2)), ratingCount, commentsCount: commentsCount || 0 };
  }

  private static async recalculateResourceOwner(resourceId: string) {
    const { data } = await supabase.from('resources').select('uploader_id').eq('id', resourceId).single();
    if (data?.uploader_id) await AnalyticsService.recalculateKarma(data.uploader_id);
  }

  static async getRatings(resourceId: string, userId?: string) {
    await this.approvedResource(resourceId);
    const { data, error } = await supabase.from('resource_ratings').select('id, resource_id, user_id, rating, created_at, updated_at')
      .eq('resource_id', resourceId).order('created_at', { ascending: false });
    if (error) throw error;
    const summary = await this.refreshResource(resourceId);
    return { ratings: data || [], ...summary, userRating: (data || []).find((r) => r.user_id === userId) || null };
  }

  static async createRating(userId: string, resourceId: string, rating: number) {
    await this.approvedResource(resourceId);
    const { data: existing } = await supabase.from('resource_ratings').select('id').eq('resource_id', resourceId).eq('user_id', userId).maybeSingle();
    if (existing) throw new ConflictError('You have already rated this resource. Update the existing rating instead.');
    const { data, error } = await supabase.from('resource_ratings').insert({ resource_id: resourceId, user_id: userId, rating }).select().single();
    if (error) throw error;
    const summary = await this.refreshResource(resourceId);
    await this.recalculateResourceOwner(resourceId);
    return { rating: data, ...summary };
  }

  static async updateRating(userId: string, role: string, id: string, rating: number) {
    const { data: current } = await supabase.from('resource_ratings').select('*').eq('id', id).maybeSingle();
    if (!current) throw new NotFoundError('Rating not found.');
    if (current.user_id !== userId && !moderatorRoles.has(role)) throw new ForbiddenError('You can only edit your own rating.');
    const { data, error } = await supabase.from('resource_ratings').update({ rating, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    const summary = await this.refreshResource(current.resource_id);
    await this.recalculateResourceOwner(current.resource_id);
    return { rating: data, ...summary };
  }

  static async deleteRating(userId: string, role: string, id: string) {
    const { data: current } = await supabase.from('resource_ratings').select('*').eq('id', id).maybeSingle();
    if (!current) throw new NotFoundError('Rating not found.');
    if (current.user_id !== userId && !moderatorRoles.has(role)) throw new ForbiddenError('You can only delete your own rating.');
    const { error } = await supabase.from('resource_ratings').delete().eq('id', id);
    if (error) throw error;
    const summary = await this.refreshResource(current.resource_id);
    await this.recalculateResourceOwner(current.resource_id);
    return summary;
  }

  static async getComments(resourceId: string, userId?: string) {
    await this.approvedResource(resourceId);
    const { data, error } = await supabase.from('resource_comments').select(`
      id, resource_id, user_id, parent_comment_id, content, created_at, updated_at,
      user:users(id, full_name, username, avatar_url), comment_likes(user_id)
    `).eq('resource_id', resourceId).is('deleted_at', null).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id, resourceId: row.resource_id, userId: row.user_id,
      parentCommentId: row.parent_comment_id, content: row.content,
      createdAt: row.created_at, updatedAt: row.updated_at, author: row.user,
      likesCount: row.comment_likes?.length || 0,
      isLikedByCurrentUser: !!userId && row.comment_likes?.some((like: any) => like.user_id === userId)
    }));
  }

  static async createComment(userId: string, resourceId: string, content: string, parentCommentId?: string | null) {
    const resource = await this.approvedResource(resourceId);
    if (resource.comments_locked) throw new ForbiddenError('Comments are locked for this resource.');
    const safeContent = clean(content);
    if (!safeContent) throw new BadRequestError('Comment content is required.');
    let depth = 1;
    if (parentCommentId) {
      let cursor: string | null = parentCommentId;
      while (cursor) {
        const { data: parent }: { data: { resource_id: string; parent_comment_id: string | null; deleted_at: string | null } | null } = await supabase.from('resource_comments').select('resource_id, parent_comment_id, deleted_at').eq('id', cursor).maybeSingle();
        if (!parent || parent.deleted_at || parent.resource_id !== resourceId) throw new BadRequestError('Invalid parent comment.');
        depth += 1; cursor = parent.parent_comment_id;
        if (depth > 3) throw new BadRequestError('Replies are limited to 3 levels.');
      }
    }
    const recentSince = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase.from('resource_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', recentSince);
    if ((count || 0) >= 5) throw new BadRequestError('Please wait before posting more comments.');
    const { data, error } = await supabase.from('resource_comments').insert({ resource_id: resourceId, user_id: userId, parent_comment_id: parentCommentId || null, content: safeContent })
      .select('id, resource_id, user_id, parent_comment_id, content, created_at, updated_at, user:users(id, full_name, username, avatar_url)').single();
    if (error) throw error;
    await this.refreshResource(resourceId);
    await AnalyticsService.recalculateKarma(userId);
    return { ...data, resourceId: data.resource_id, userId: data.user_id, parentCommentId: data.parent_comment_id, createdAt: data.created_at, updatedAt: data.updated_at, author: (data as any).user, likesCount: 0, isLikedByCurrentUser: false };
  }

  static async updateComment(userId: string, id: string, content: string) {
    const { data: current } = await supabase.from('resource_comments').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (!current) throw new NotFoundError('Comment not found.');
    if (current.user_id !== userId) throw new ForbiddenError('You can only edit your own comment.');
    const safeContent = clean(content);
    if (!safeContent) throw new BadRequestError('Comment content is required.');
    const { data, error } = await supabase.from('resource_comments').update({ content: safeContent, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteComment(userId: string, role: string, id: string) {
    const { data: current } = await supabase.from('resource_comments').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
    if (!current) throw new NotFoundError('Comment not found.');
    if (current.user_id !== userId && !moderatorRoles.has(role)) throw new ForbiddenError('You cannot delete this comment.');
    const { error } = await supabase.from('resource_comments').update({ deleted_at: new Date().toISOString(), content: '[deleted]' }).eq('id', id);
    if (error) throw error;
    await this.refreshResource(current.resource_id);
    await AnalyticsService.recalculateKarma(current.user_id);
  }

  static async toggleLike(userId: string, commentId: string) {
    const { data: comment } = await supabase.from('resource_comments').select('id, user_id, resource_id, deleted_at').eq('id', commentId).maybeSingle();
    if (!comment || comment.deleted_at) throw new NotFoundError('Comment not found.');
    const { data: existing } = await supabase.from('comment_likes').select('id').eq('comment_id', commentId).eq('user_id', userId).maybeSingle();
    if (existing) await supabase.from('comment_likes').delete().eq('id', existing.id);
    else await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
    const { count } = await supabase.from('comment_likes').select('id', { count: 'exact', head: true }).eq('comment_id', commentId);
    await AnalyticsService.recalculateKarma(comment.user_id);
    return { liked: !existing, likesCount: count || 0 };
  }

  static async lockComments(resourceId: string, role: string, locked: boolean) {
    if (!moderatorRoles.has(role)) throw new ForbiddenError('Moderator access required.');
    await this.approvedResource(resourceId);
    const { error } = await supabase.from('resources').update({ comments_locked: locked }).eq('id', resourceId);
    if (error) throw error;
    return { locked };
  }
}

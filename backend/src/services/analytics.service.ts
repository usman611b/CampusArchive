import NodeCache from 'node-cache';
import { supabase } from '../config/database';

const dashboardCache = new NodeCache({ stdTTL: 30 }); // 30-Second TTL for Dashboard Metrics

export interface DashboardPayload {
  platformCounters: {
    totalResources: number;
    totalStudents: number;
    totalDownloads: number;
    totalCourses: number;
  };
  topContributor: {
    id?: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
    department: string;
    score: number;
    rating: number;
  } | null;
  leaderboard: Array<{
    rank: number;
    id?: string;
    name?: string;
    username?: string;
    score?: number;
    uploads?: number;
    downloads?: number;
  }>;
}

export class AnalyticsService {
  static flushCache() {
    dashboardCache.flushAll();
  }

  static computeKarmaScore(metrics: {
    uploadsCount: number;
    downloadsCount: number;
    avgRating: number;
    ratingReceivedCount: number;
    bookmarksCount: number;
    helpfulCommentsCount: number;
  }): number {
    return (
      metrics.uploadsCount * 50 +
      metrics.downloadsCount * 2 +
      metrics.ratingReceivedCount * 5 +
      metrics.bookmarksCount * 5 +
      metrics.helpfulCommentsCount * 10
    );
  }

  static async recalculateKarma(userId: string): Promise<number> {
    try {
      // 1. Get approved non-deleted resources uploaded by user
      const { data: userResources } = await supabase
        .from('resources')
        .select('id')
        .eq('uploader_id', userId)
        .eq('status', 'APPROVED')
        .is('deleted_at', null);

      const resourceIds = (userResources || []).map((r) => r.id);
      const uploadsCount = resourceIds.length;

      let downloadsCount = 0;
      let avgRating = 0;
      let ratingReceivedCount = 0;

      if (resourceIds.length > 0) {
        // 2. Count total downloads across user's active resources
        const { count: dlCount } = await supabase
          .from('downloads')
          .select('id', { count: 'exact', head: true })
          .in('resource_id', resourceIds);
        downloadsCount = dlCount || 0;

        // 3. Average rating across user's active resources
        const { data: ratingRows } = await supabase
          .from('resource_ratings')
          .select('rating')
          .in('resource_id', resourceIds);
        if (ratingRows && ratingRows.length > 0) {
          ratingReceivedCount = ratingRows.length;
          const sum = ratingRows.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = sum / ratingRows.length;
        }
      }

      // 4. Bookmarks on user's active resources
      let bookmarksCount = 0;
      if (resourceIds.length > 0) {
        const { count: bmCount } = await supabase
          .from('bookmarks')
          .select('id', { count: 'exact', head: true })
          .in('resource_id', resourceIds);
        bookmarksCount = bmCount || 0;
      }

      // 5. Helpful comments by user
      const { data: userComments } = await supabase.from('resource_comments').select('id').eq('user_id', userId).is('deleted_at', null);
      const commentIds = (userComments || []).map((comment) => comment.id);
      let commentLikesReceived = 0;
      let helpfulCommentsCount = 0;
      if (commentIds.length) {
        const { data: likes, count } = await supabase.from('comment_likes').select('comment_id', { count: 'exact' }).in('comment_id', commentIds);
        commentLikesReceived = count || 0;
        helpfulCommentsCount = new Set((likes || []).map((like) => like.comment_id)).size;
      }

      const karmaScore = this.computeKarmaScore({
        uploadsCount,
        downloadsCount,
        avgRating,
        ratingReceivedCount,
        bookmarksCount,
        helpfulCommentsCount
      }) + commentLikesReceived * 2;

      await supabase
        .from('contributor_metrics')
        .upsert({
          user_id: userId,
          uploads_count: uploadsCount,
          downloads_count: downloadsCount,
          avg_rating: avgRating,
          bookmarks_count: bookmarksCount,
          helpful_comments_count: helpfulCommentsCount,
          karma_score: karmaScore,
          last_calculated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      dashboardCache.flushAll();
      return karmaScore;
    } catch {
      return 0;
    }
  }

  static async getLeaderboard(): Promise<Array<any>> {
    // Recalculate karma for every active platform contributor, regardless of RBAC role.
    const { data: contributors } = await supabase
      .from('users')
      .select('id')
      .is('deleted_at', null);

    for (const contributor of contributors || []) {
      await this.recalculateKarma(contributor.id).catch(() => {});
    }

    const { data: topMetrics } = await supabase
      .from('contributor_metrics')
      .select('*, users!inner(id, full_name, username, avatar_url, departments(name))')
      .gt('karma_score', 0)
      .order('karma_score', { ascending: false })
      .limit(10);

    return (topMetrics || []).map((m: any, index: number) => ({
      rank: index + 1,
      id: m.users?.id,
      name: m.users?.full_name || 'Student Contributor',
      username: m.users?.username || 'student',
      avatarUrl: m.users?.avatar_url,
      department: m.users?.departments?.name || 'Academic Department',
      score: m.karma_score || 0,
      uploads: m.uploads_count || 0,
      downloads: m.downloads_count || 0,
      rating: parseFloat(m.avg_rating || '0')
    }));
  }

  static async getDashboardMetrics(): Promise<DashboardPayload> {
    const cacheKey = 'global_dashboard_metrics';
    const cached = dashboardCache.get<DashboardPayload>(cacheKey);
    if (cached) return cached;

    // 1. Get active approved resources count & IDs
    const { data: activeRes, count: totalResources } = await supabase
      .from('resources')
      .select('id', { count: 'exact' })
      .eq('status', 'APPROVED')
      .is('deleted_at', null);

    const activeIds = (activeRes || []).map((r) => r.id);

    // 2. Derive total downloads for active approved resources only
    let totalDownloads = 0;
    if (activeIds.length > 0) {
      const { count: dlCount } = await supabase
        .from('downloads')
        .select('id', { count: 'exact', head: true })
        .in('resource_id', activeIds);
      totalDownloads = dlCount || 0;
    }

    // 3. Platform counts for active registered users and non-deleted courses.
    const [{ count: totalStudents }, { count: totalCourses }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('courses').select('*', { count: 'exact', head: true }).is('deleted_at', null)
    ]);

    // 4. Contributor leaderboard (active accounts with karma_score > 0)
    const leaderboard = await this.getLeaderboard();

    const topContributor = leaderboard.length > 0 ? {
      id: leaderboard[0].id,
      name: leaderboard[0].name,
      username: leaderboard[0].username,
      avatarUrl: leaderboard[0].avatarUrl,
      department: leaderboard[0].department,
      score: leaderboard[0].score,
      rating: leaderboard[0].rating
    } : null;

    const payload: DashboardPayload = {
      platformCounters: {
        totalResources: totalResources || 0,
        totalStudents: totalStudents || 0,
        totalDownloads: totalDownloads || 0,
        totalCourses: totalCourses || 0
      },
      topContributor,
      leaderboard
    };

    dashboardCache.set(cacheKey, payload);
    return payload;
  }
}

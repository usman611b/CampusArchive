import { supabase } from '../config/database';
import { CreateResourceInput } from '../validators/resource.validator';

import { AnalyticsService } from '../services/analytics.service';

export class ResourceRepository {
  static async checkFileHashExists(fileHash: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('resources')
      .select('id')
      .eq('file_hash', fileHash)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  static async createResource(uploaderId: string, input: CreateResourceInput) {
    // Verify course_id foreign key exists in database
    const { data: courseCheck } = await supabase.from('courses').select('id').eq('id', input.courseId).maybeSingle();
    if (!courseCheck) {
      throw new Error('INVALID_COURSE: The specified course does not exist. Please select a valid course.');
    }

    // Verify category_id foreign key exists in database
    const { data: categoryCheck } = await supabase.from('categories').select('id').eq('id', input.categoryId).maybeSingle();
    if (!categoryCheck) {
      throw new Error('INVALID_CATEGORY: The specified category does not exist. Please select a valid category.');
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        uploader_id: uploaderId,
        course_id: input.courseId,
        chapter_id: input.chapterId || null,
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        file_storage_path: input.fileStoragePath,
        file_hash: input.fileHash,
        version: input.version || '1.0',
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize analytical metrics record
    await supabase.from('resource_analytics').insert({
      resource_id: data.id,
      views_count: 0,
      downloads_count: 0
    });

    // Save tags into tags and resource_tags tables
    if (input.tags && Array.isArray(input.tags) && input.tags.length > 0) {
      for (const tagStr of input.tags) {
        const cleanTag = tagStr.trim();
        if (!cleanTag) continue;
        const slug = cleanTag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!slug) continue;

        let { data: tagRow } = await supabase
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!tagRow) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: cleanTag, slug })
            .select('id')
            .single();
          tagRow = newTag;
        }

        if (tagRow) {
          try {
            await supabase
              .from('resource_tags')
              .upsert({ resource_id: data.id, tag_id: tagRow.id }, { onConflict: 'resource_id,tag_id' });
          } catch (rtErr) {}
        }
      }
    }

    return data;
  }

  static async createStorageMetadata(resourceId: string, fileHash: string, mimeType: string, fileSizeBytes: number) {
    const { error } = await supabase.from('storage_metadata').insert({
      resource_id: resourceId,
      file_hash: fileHash,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      virus_scan_status: 'PASSED'
    });

    if (error) throw error;
  }

  static async logDownloadAudit(resourceId: string, userId?: string, ipAddress?: string, deviceInfo?: string) {
    await supabase.from('downloads').insert({
      resource_id: resourceId,
      user_id: userId || null,
      ip_address: ipAddress || '127.0.0.1',
      device_info: deviceInfo || 'Browser Client'
    });

    // Increment downloads count in analytics table
    const { data: analytics } = await supabase
      .from('resource_analytics')
      .select('downloads_count')
      .eq('resource_id', resourceId)
      .single();

    const currentCount = analytics?.downloads_count || 0;
    await supabase
      .from('resource_analytics')
      .update({ downloads_count: currentCount + 1 })
      .eq('resource_id', resourceId);

    // Recalculate uploader karma score
    const { data: res } = await supabase.from('resources').select('uploader_id').eq('id', resourceId).single();
    if (res?.uploader_id) {
      AnalyticsService.recalculateKarma(res.uploader_id).catch(() => {});
    }
  }

  static async logViewAudit(resourceId: string, userId?: string, ipAddress?: string) {
    await supabase.from('views').insert({
      resource_id: resourceId,
      user_id: userId || null,
      ip_address: ipAddress || '127.0.0.1'
    });

    const { data: analytics } = await supabase
      .from('resource_analytics')
      .select('views_count')
      .eq('resource_id', resourceId)
      .single();

    const currentCount = analytics?.views_count || 0;
    await supabase
      .from('resource_analytics')
      .update({ views_count: currentCount + 1 })
      .eq('resource_id', resourceId);
  }

  static async getResourcesByCourse(courseId: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        users!resources_uploader_id_fkey(full_name),
        categories(id, name, slug),
        course:courses(id, code, title, semesters(semester_number, title), programs(code, name, departments(id, name, code, slug))),
        resource_analytics(*),
        storage_metadata(*),
        resource_tags(tags(id, name, slug))
      `)
      .eq('course_id', courseId)
      .eq('status', 'APPROVED')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getResourceById(id: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        users!resources_uploader_id_fkey(full_name),
        categories(id, name, slug),
        course:courses(id, code, title, semesters(semester_number, title), programs(code, name, departments(id, name, code, slug))),
        resource_analytics(*),
        storage_metadata(*),
        resource_tags(tags(id, name, slug))
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async toggleBookmark(userId: string, resourceId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single();

    let added = false;
    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      added = false;
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, resource_id: resourceId });
      added = true;
    }

    // Recalculate uploader karma score
    const { data: res } = await supabase.from('resources').select('uploader_id').eq('id', resourceId).single();
    if (res?.uploader_id) {
      AnalyticsService.recalculateKarma(res.uploader_id).catch(() => {});
    }

    return added;
  }

  static async upsertRating(userId: string, resourceId: string, stars: number, reviewText?: string) {
    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        resource_id: resourceId,
        stars,
        review_text: reviewText || null
      })
      .select()
      .single();

    if (error) throw error;

    // Recalculate uploader karma score
    const { data: res } = await supabase.from('resources').select('uploader_id').eq('id', resourceId).single();
    if (res?.uploader_id) {
      AnalyticsService.recalculateKarma(res.uploader_id).catch(() => {});
    }

    return data;
  }
}

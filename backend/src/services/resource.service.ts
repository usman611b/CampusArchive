import { supabase } from '../config/database';
import { ResourceRepository } from '../repositories/resource.repository';
import { CreatePreSignedUrlInput, CreateResourceInput, RateResourceInput } from '../validators/resource.validator';
import { ResourceMapper, ResourceResponseDto } from '../dtos/resource.dto';

export class ResourceService {
  static async generateUploadUrl(input: CreatePreSignedUrlInput) {
    const fileExtension = input.fileName.split('.').pop() || 'pdf';
    const uniquePath = `resources/${input.courseId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('academic_resources')
      .createSignedUploadUrl(uniquePath);

    if (error) {
      console.error('[STORAGE] createSignedUploadUrl failed:', error.message);
      throw new Error(`STORAGE_ERROR: Failed to generate upload URL. ${error.message}`);
    }

    return {
      signedUploadUrl: data.signedUrl,
      fileStoragePath: uniquePath
    };
  }

  static async createResource(uploaderId: string, input: CreateResourceInput): Promise<ResourceResponseDto> {
    const fileHash = input.fileHash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // fileStoragePath must be the real path returned by Supabase Storage — never use a hardcoded fallback.
    // It is set either from the pre-signed upload flow (fileStoragePath) or from the direct base64 upload below.
    let fileStoragePath = input.fileStoragePath || null;

    const mimeType = input.mimeType || 'application/pdf';
    const fileSizeBytes = input.fileSizeBytes || 0;

    // Handle direct Base64 file upload to Supabase Storage Bucket
    if (input.fileBase64 && input.fileBase64.startsWith('data:')) {
      try {
        const matches = input.fileBase64.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const fileBuffer = Buffer.from(matches[2], 'base64');
          const ext = input.title.split('.').pop() || (mimeType.includes('png') ? 'png' : mimeType.includes('jpg') || mimeType.includes('jpeg') ? 'jpg' : 'pdf');
          const storagePath = `uploads/${input.courseId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

          const { data: storageResult, error: uploadErr } = await supabase.storage
            .from('academic_resources')
            .upload(storagePath, fileBuffer, {
              contentType: mimeType,
              upsert: true
            });

          if (!uploadErr && storageResult) {
            fileStoragePath = storageResult.path;
          } else {
            // Do NOT fall back to storing the raw base64 as the path — that corrupts the DB record
            throw new Error(`STORAGE_ERROR: Supabase upload rejected the file. ${uploadErr?.message || 'Unknown error'}`);
          }
        }
      } catch (err: any) {
        console.warn('[STORAGE] Base64 processing warning:', err.message);
        // Do not fall back to storing the raw base64 data URL — that would corrupt the path
        throw new Error(`STORAGE_ERROR: Failed to process and upload file. ${err.message}`);
      }
    }

    // At this point we must have a real Supabase Storage path
    if (!fileStoragePath) {
      throw new Error('STORAGE_ERROR: No file storage path available. Upload the file to Supabase Storage first, then provide the returned path.');
    }

    const processedInput = {
      ...input,
      fileHash,
      fileStoragePath
    };

    const newResource = await ResourceRepository.createResource(uploaderId, processedInput);

    await ResourceRepository.createStorageMetadata(
      newResource.id,
      fileHash,
      mimeType,
      fileSizeBytes
    );

    // Notify all admins and moderators that a new resource is queued for moderation
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .neq('role', 'STUDENT')
        .is('deleted_at', null);

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map((admin: any) => ({
          user_id: admin.id,
          type: 'SYSTEM',
          title: 'New Upload Pending Moderation',
          description: `Resource "${newResource.title}" was submitted and is queued in the Moderation Approval Console.`,
          is_read: false
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }
    } catch (nErr: any) {
      console.warn('[NOTIFICATIONS] Failed to dispatch admin upload alert:', nErr.message);
    }

    return ResourceMapper.toDto(newResource, { file_size_bytes: fileSizeBytes, mime_type: mimeType }, input.tags);
  }

  static async getCourseResources(courseId: string): Promise<ResourceResponseDto[]> {
    const rows = await ResourceRepository.getResourcesByCourse(courseId);
    return rows.map((row) => ResourceMapper.toDto(row, row.storage_metadata?.[0]));
  }

  static async getResourceDetail(id: string, userId?: string, ipAddress?: string): Promise<ResourceResponseDto> {
    const row = await ResourceRepository.getResourceById(id);
    if (!row) throw new Error('RESOURCE_NOT_FOUND: Resource document not found.');

    await ResourceRepository.logViewAudit(id, userId, ipAddress);
    const dto = ResourceMapper.toDto(row, row.storage_metadata?.[0]);
    const { data: related } = await supabase.from('resources').select('id, title, resource_analytics(rating_avg, rating_count)')
      .eq('course_id', row.course_id).eq('status', 'APPROVED').is('deleted_at', null).neq('id', id).order('created_at', { ascending: false }).limit(4);
    dto.relatedResources = (related || []).map((item: any) => ({
      id: item.id, title: item.title,
      averageRating: Number(item.resource_analytics?.rating_avg || 0),
      ratingCount: item.resource_analytics?.rating_count || 0
    }));
    return dto;
  }

  static async downloadResource(id: string, userId?: string, ipAddress?: string, deviceInfo?: string) {
    const row = await ResourceRepository.getResourceById(id);
    if (!row) throw new Error('RESOURCE_NOT_FOUND: Resource document not found.');

    await ResourceRepository.logDownloadAudit(id, userId, ipAddress, deviceInfo);

    // If fileStoragePath is already a data URL or external HTTP link, return it directly
    if (row.file_storage_path && (row.file_storage_path.startsWith('data:') || row.file_storage_path.startsWith('http'))) {
      return {
        downloadUrl: row.file_storage_path,
        fileName: row.title
      };
    }
    
    // Create signed URL for Supabase storage bucket
    const { data, error } = await supabase.storage
      .from('academic_resources')
      .createSignedUrl(row.file_storage_path, 3600);

    if (error || !data?.signedUrl) {
      const { data: publicData } = supabase.storage.from('academic_resources').getPublicUrl(row.file_storage_path);
      return {
        downloadUrl: publicData.publicUrl,
        fileName: row.title
      };
    }

    return {
      downloadUrl: data.signedUrl,
      fileName: row.title
    };
  }

  static async toggleBookmark(userId: string, resourceId: string) {
    const isBookmarked = await ResourceRepository.toggleBookmark(userId, resourceId);
    return { isBookmarked };
  }

  static async rateResource(userId: string, resourceId: string, input: RateResourceInput) {
    const rating = await ResourceRepository.upsertRating(userId, resourceId, input.stars, input.reviewText);
    return rating;
  }
}

import { randomBytes, randomUUID } from 'crypto';
import { supabase } from '../config/database';
import { ResourceRepository } from '../repositories/resource.repository';
import { CreatePreSignedUrlInput, CreateResourceInput, RateResourceInput } from '../validators/resource.validator';
import { ResourceMapper, ResourceResponseDto } from '../dtos/resource.dto';
import { ForbiddenError, NotFoundError } from '../utils/customErrors';

const moderatorRoles = new Set(['MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN']);

export class ResourceService {
  static async generateUploadUrl(userId: string, input: CreatePreSignedUrlInput) {
    const fileExtension = input.fileName.split('.').pop()!.toLowerCase();
    const uniquePath = `resources/${userId}/${input.courseId}/${randomUUID()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('academic_resources')
      .createSignedUploadUrl(uniquePath);

    if (error) throw new Error('STORAGE_ERROR: Failed to generate a secure upload URL.');

    return { signedUploadUrl: data.signedUrl, fileStoragePath: uniquePath };
  }

  static async createResource(uploaderId: string, input: CreateResourceInput): Promise<ResourceResponseDto> {
    const fileHash = input.fileHash || randomBytes(32).toString('hex');
    const fileStoragePath = input.fileStoragePath;
    const expectedPrefix = `resources/${uploaderId}/${input.courseId}/`;

    if (!fileStoragePath.startsWith(expectedPrefix) || fileStoragePath.includes('..')) {
      throw new ForbiddenError('The uploaded file path does not belong to this user and course.');
    }

    const newResource = await ResourceRepository.createResource(uploaderId, {
      ...input,
      fileHash,
      fileStoragePath
    });

    await ResourceRepository.createStorageMetadata(
      newResource.id,
      fileHash,
      input.mimeType,
      input.fileSizeBytes
    );

    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .neq('role', 'STUDENT')
        .is('deleted_at', null);

      if (admins?.length) {
        await supabase.from('notifications').insert(admins.map((admin: any) => ({
          user_id: admin.id,
          type: 'SYSTEM',
          title: 'New Upload Pending Moderation',
          description: `Resource "${newResource.title}" was submitted and is queued in the Moderation Approval Console.`,
          is_read: false
        })));
      }
    } catch {
      // Notification delivery must not expose database details or fail the upload.
    }

    return ResourceMapper.toDto(
      newResource,
      { file_size_bytes: input.fileSizeBytes, mime_type: input.mimeType },
      input.tags
    );
  }

  static async getCourseResources(courseId: string): Promise<ResourceResponseDto[]> {
    const rows = await ResourceRepository.getResourcesByCourse(courseId);
    return rows.map((row) => ResourceMapper.toDto(row, row.storage_metadata?.[0]));
  }

  static async getResourceDetail(id: string, userId?: string, role?: string, ipAddress?: string): Promise<ResourceResponseDto> {
    const row = await ResourceRepository.getResourceById(id);
    if (!row || (row.status !== 'APPROVED' && row.uploader_id !== userId && !moderatorRoles.has(role || ''))) {
      throw new NotFoundError('Resource document not found.');
    }

    await ResourceRepository.logViewAudit(id, userId, ipAddress);
    const dto = ResourceMapper.toDto(row, row.storage_metadata?.[0]);
    const { data: related } = await supabase
      .from('resources')
      .select('id, title, resource_analytics(rating_avg, rating_count)')
      .eq('course_id', row.course_id)
      .eq('status', 'APPROVED')
      .is('deleted_at', null)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(4);

    dto.relatedResources = (related || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      averageRating: Number(item.resource_analytics?.rating_avg || 0),
      ratingCount: item.resource_analytics?.rating_count || 0
    }));
    return dto;
  }

  static async downloadResource(id: string, userId?: string, role?: string, ipAddress?: string, deviceInfo?: string) {
    const row = await ResourceRepository.getResourceById(id);
    if (!row || (row.status !== 'APPROVED' && row.uploader_id !== userId && !moderatorRoles.has(role || ''))) {
      throw new NotFoundError('Resource document not found.');
    }

    const { data, error } = await supabase.storage
      .from('academic_resources')
      .createSignedUrl(row.file_storage_path, 300, { download: row.title });

    if (error || !data?.signedUrl) throw new Error('STORAGE_ERROR: Unable to create a secure download link.');

    await ResourceRepository.logDownloadAudit(id, userId, ipAddress, deviceInfo);
    return { downloadUrl: data.signedUrl, fileName: row.title };
  }

  static async toggleBookmark(userId: string, resourceId: string) {
    const isBookmarked = await ResourceRepository.toggleBookmark(userId, resourceId);
    return { isBookmarked };
  }

  static async rateResource(userId: string, resourceId: string, input: RateResourceInput) {
    return ResourceRepository.upsertRating(userId, resourceId, input.stars, input.reviewText);
  }
}

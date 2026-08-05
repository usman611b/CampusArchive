export interface ResourceResponseDto {
  id: string;
  uploaderId: string;
  uploaderName?: string;
  courseId: string;
  courseCode?: string;
  courseTitle?: string;
  departmentName?: string;
  semesterName?: string;
  programName?: string;
  chapterId?: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  description: string;
  fileStoragePath: string;
  downloadUrl?: string;
  fileHash: string;
  fileType: string;
  fileSizeFormatted: string;
  fileSizeBytes: number;
  version: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  viewsCount: number;
  downloadsCount: number;
  averageRating: number;
  ratingCount: number;
  commentsCount: number;
  commentsLocked: boolean;
  tags: string[];
  createdAt: string;
  relatedResources?: Array<{ id: string; title: string; averageRating: number; ratingCount: number }>;
}

export class ResourceMapper {
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static toDto(resourceRow: any, metadataRow?: any, tagList?: string[]): ResourceResponseDto {
    const meta = metadataRow || (Array.isArray(resourceRow.storage_metadata) ? resourceRow.storage_metadata[0] : resourceRow.storage_metadata) || {};
    const bytes = meta?.file_size_bytes || 0;

    // Extract tags from joined resource_tags
    let extractedTags: string[] = tagList || [];
    if (!tagList && resourceRow.resource_tags) {
      extractedTags = resourceRow.resource_tags.map((rt: any) => rt.tags?.name).filter(Boolean);
    }
    if (extractedTags.length === 0 && resourceRow.tags) {
      extractedTags = Array.isArray(resourceRow.tags) ? resourceRow.tags : [];
    }

    const courseObj = resourceRow.course || resourceRow.courses || {};
    const semObj = courseObj.semesters || {};
    const progObj = courseObj.programs || {};
    const deptObj = progObj.departments || {};

    const departmentName = deptObj.name || (courseObj.code ? `${courseObj.code} Department` : 'Academic');
    const semesterName = semObj.semester_number
      ? `Semester ${semObj.semester_number}`
      : semObj.title || '';

    let fileType = 'PDF';
    if (meta?.mime_type) {
      if (meta.mime_type.includes('pdf')) fileType = 'PDF';
      else if (meta.mime_type.includes('word') || meta.mime_type.includes('document')) fileType = 'DOCX';
      else if (meta.mime_type.includes('presentation') || meta.mime_type.includes('powerpoint')) fileType = 'PPTX';
      else if (meta.mime_type.includes('zip') || meta.mime_type.includes('compressed')) fileType = 'ZIP';
      else if (meta.mime_type.includes('png') || meta.mime_type.includes('jpeg') || meta.mime_type.includes('image')) fileType = 'IMG';
      else fileType = meta.mime_type.split('/').pop()?.toUpperCase() || 'FILE';
    }

    return {
      id: resourceRow.id,
      uploaderId: resourceRow.uploader_id,
      uploaderName: resourceRow.users?.full_name || 'Anonymous Contributor',
      courseId: resourceRow.course_id,
      courseCode: courseObj.code || '',
      courseTitle: courseObj.title || '',
      departmentName,
      semesterName,
      programName: progObj.name || '',
      chapterId: resourceRow.chapter_id,
      categoryId: resourceRow.category_id,
      categoryName: resourceRow.categories?.name || 'General',
      title: resourceRow.title,
      description: resourceRow.description,
      fileStoragePath: resourceRow.file_storage_path,
      fileHash: resourceRow.file_hash,
      fileType,
      fileSizeFormatted: this.formatBytes(bytes),
      fileSizeBytes: bytes,
      version: resourceRow.version || '1.0',
      status: resourceRow.status || 'PENDING',
      viewsCount: resourceRow.resource_analytics?.views_count || 0,
      downloadsCount: resourceRow.resource_analytics?.downloads_count || 0,
      averageRating: parseFloat(resourceRow.resource_analytics?.rating_avg || '0.0'),
      ratingCount: resourceRow.resource_analytics?.rating_count || 0,
      commentsCount: resourceRow.resource_analytics?.comments_count || 0,
      commentsLocked: !!resourceRow.comments_locked,
      tags: extractedTags,
      createdAt: resourceRow.created_at
    };
  }
}

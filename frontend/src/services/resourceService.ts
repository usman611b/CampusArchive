import { apiClient } from './apiClient';

export interface PreSignedUrlResponse {
  signedUploadUrl: string;
  fileStoragePath: string;
}

export interface RatingSummary {
  ratings: Array<{ id: string; resource_id: string; user_id: string; rating: number; created_at: string; updated_at: string }>;
  averageRating: number;
  ratingCount: number;
  userRating: { id: string; rating: number } | null;
}

export interface ResourceComment {
  id: string;
  resourceId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; full_name: string; username: string; avatar_url: string | null };
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

export class ResourceService {
  static async getResource(resourceId: string): Promise<any> {
    const response = await apiClient.get(`/resources/${resourceId}`);
    return response.data.data.resource;
  }
  static async getUploadUrl(fileName: string, fileType: string, fileSizeBytes: number, courseId: string): Promise<PreSignedUrlResponse> {
    const response = await apiClient.post('/resources/upload-url', {
      fileName,
      fileType,
      fileSizeBytes,
      courseId
    });
    return response.data.data;
  }

  static async createResource(payload: {
    courseId: string;
    chapterId?: string;
    categoryId: string;
    title: string;
    description: string;
    fileStoragePath: string;
    fileHash: string;
    tags?: string[];
  }): Promise<any> {
    const response = await apiClient.post('/resources', payload);
    return response.data.data.resource;
  }

  static async getCourseResources(courseId: string): Promise<any[]> {
    const response = await apiClient.get(`/resources/course/${courseId}`);
    return response.data.data.resources;
  }

  static async downloadResource(resourceId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await apiClient.post(`/resources/${resourceId}/download`);
    return response.data.data;
  }

  static async toggleBookmark(resourceId: string): Promise<{ isBookmarked: boolean }> {
    const response = await apiClient.post(`/resources/${resourceId}/bookmark`);
    return response.data.data;
  }

  static async rateResource(resourceId: string, stars: number, existingRatingId?: string): Promise<any> {
    const response = existingRatingId
      ? await apiClient.patch(`/ratings/${existingRatingId}`, { rating: stars })
      : await apiClient.post('/ratings', { resourceId, rating: stars });
    return response.data.data;
  }

  static async getRatings(resourceId: string): Promise<RatingSummary> { const response = await apiClient.get(`/resources/${resourceId}/ratings`); return response.data.data; }
  static async deleteRating(ratingId: string): Promise<any> { const response = await apiClient.delete(`/ratings/${ratingId}`); return response.data.data; }
  static async getComments(resourceId: string): Promise<ResourceComment[]> { const response = await apiClient.get(`/resources/${resourceId}/comments`); return response.data.data.comments; }
  static async addComment(resourceId: string, content: string, parentCommentId?: string): Promise<ResourceComment> { const response = await apiClient.post('/comments', { resourceId, content, parentCommentId: parentCommentId || null }); return response.data.data.comment; }
  static async updateComment(id: string, content: string): Promise<ResourceComment> { const response = await apiClient.patch(`/comments/${id}`, { content }); return response.data.data.comment; }
  static async deleteComment(id: string): Promise<void> { await apiClient.delete(`/comments/${id}`); }
  static async toggleCommentLike(id: string): Promise<{ liked: boolean; likesCount: number }> { const response = await apiClient.post(`/comments/${id}/likes`); return response.data.data; }
  static async lockComments(resourceId: string, locked: boolean): Promise<{ locked: boolean }> { const response = await apiClient.patch(`/resources/${resourceId}/comments/lock`, { locked }); return response.data.data; }
}

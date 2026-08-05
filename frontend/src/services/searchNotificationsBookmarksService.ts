import { apiClient } from './apiClient';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  averageRating?: number;
  ratingCount?: number;
  commentsCount?: number;
  category?: { id: string; name: string; slug: string } | null;
  uploader?: { fullName: string; username: string; avatarUrl?: string | null } | null;
  course?: {
    id: string;
    code: string;
    title: string;
    semesterNumber: number;
  } | null;
}

export interface SearchCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SearchDepartment {
  id: string;
  name: string;
  code: string;
  slug: string;
}

export interface SearchResponse {
  resources: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'APPROVAL' | 'REJECTION' | 'COMMENT_REPLY' | 'KARMA_EARNED' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, any> | null;
}

export interface BookmarkItem {
  bookmarkId: string;
  savedAt: string;
  id: string;
  title: string;
  description: string;
  createdAt: string;
  uploaderName?: string;
  courseTitle?: string;
  departmentName?: string;
  semesterName?: string;
  categoryName?: string;
  fileType?: string;
  fileSizeFormatted?: string;
  averageRating?: number;
  ratingCount?: number;
  commentsCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  tags?: string[];
  category?: { id: string; name: string; slug: string } | null;
  uploader?: { fullName: string; username: string } | null;
  course?: { id: string; code: string; title: string; semesterNumber: number } | null;
}

export class SearchService {
  static async search(params: {
    q?: string;
    category?: string;
    department?: string;
    semester?: string;
    sort?: 'latest' | 'rating' | 'downloads';
    page?: number;
    limit?: number;
  }): Promise<SearchResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category) query.set('category', params.category);
    if (params.department) query.set('department', params.department);
    if (params.semester) query.set('semester', params.semester);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get(`/search?${query.toString()}`);
    return response.data.data;
  }

  static async getCategories(): Promise<SearchCategory[]> {
    const response = await apiClient.get('/search/categories');
    return response.data.data.categories ?? [];
  }

  static async getDepartments(): Promise<SearchDepartment[]> {
    const response = await apiClient.get('/search/departments');
    return response.data.data.departments ?? [];
  }
}

export class NotificationsService {
  static async getAll(): Promise<NotificationItem[]> {
    const response = await apiClient.get('/notifications');
    return (response.data.data.notifications ?? []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.description || n.message || '',
      isRead: n.is_read,
      createdAt: n.created_at,
      readAt: n.read_at,
      metadata: n.metadata
    }));
  }

  static async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  }

  static async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }

  static async clearAll(): Promise<void> {
    await apiClient.delete('/notifications/clear-all');
  }
}

export class BookmarksService {
  static async getAll(): Promise<BookmarkItem[]> {
    const response = await apiClient.get('/bookmarks');
    return response.data.data.bookmarks ?? [];
  }

  static async getIds(): Promise<string[]> {
    const response = await apiClient.get('/bookmarks/ids');
    return response.data.data.ids ?? [];
  }
}

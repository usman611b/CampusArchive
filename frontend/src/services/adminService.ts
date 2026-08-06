import { apiClient } from './apiClient';

export interface AdminAnalytics {
  totalUsers: number;
  totalResources: number;
  pendingResources: number;
  approvedResources: number;
  totalDownloads: number;
  topContributors: {
    userId: string;
    fullName: string;
    username: string;
    avatarUrl?: string | null;
    uploadsCount: number;
    karmaScore: number;
    avgRating: number;
  }[];
}

export interface PendingResource {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  uploader?: { id: string; fullName: string; email: string; username: string } | null;
  course?: { id: string; title: string; code: string; semesterNumber: number } | null;
  category?: { id: string; name: string; slug: string } | null;
}

export interface AdminUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMINISTRATOR';
  isSuspended: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  universityName?: string;
  uploadsCount?: number;
}

export interface AuditLogItem {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  createdAt: string;
  reason?: string;
  admin?: { fullName: string; username: string; role?: string } | null;
  resource?: { title: string } | null;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  resourceUrl?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'SPAM';
  emailStatus: string;
  createdAt: string;
}

export interface UserUpload {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  category?: { name: string; slug?: string } | null;
  course?: { code: string; title: string } | null;
  departmentName?: string;
  semesterName?: string;
  fileSizeFormatted?: string;
  fileType?: string;
  tags?: string[];
  averageRating?: number;
  ratingCount?: number;
  commentsCount?: number;
}

export class AdminService {
  static async getAnalytics(): Promise<AdminAnalytics> {
    const response = await apiClient.get('/admin/analytics');
    return response.data.data;
  }

  static async getModerationQueue(status?: string): Promise<PendingResource[]> {
    const url = status ? `/admin/moderation-queue?status=${status}` : '/admin/moderation-queue';
    const response = await apiClient.get(url);
    return (response.data.data.pendingResources || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      createdAt: r.created_at,
      uploader: r.uploader ? {
        id: r.uploader.id,
        fullName: r.uploader.full_name,
        email: r.uploader.email,
        username: r.uploader.username
      } : null,
      course: r.course ? {
        id: r.course.id,
        title: r.course.title,
        code: r.course.code,
        semesterNumber: r.course?.semester_number || 1
      } : null,
      category: r.category
    }));
  }

  static async approveResource(id: string): Promise<void> {
    await apiClient.put(`/admin/resources/${id}/approve`);
  }

  static async rejectResource(id: string, reason?: string): Promise<void> {
    await apiClient.put(`/admin/resources/${id}/reject`, { reason });
  }

  static async featureResource(id: string): Promise<void> {
    await apiClient.put(`/admin/resources/${id}/feature`);
  }

  static async getUsers(params: {
    q?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: AdminUser[]; total: number }> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get(`/admin/users?${query.toString()}`);
    const { users, total } = response.data.data;
    return {
      total,
      users: (users || []).map((u: any) => ({
        id: u.id,
        fullName: u.full_name,
        username: u.username,
        email: u.email,
        role: u.role,
        isSuspended: u.is_suspended,
        createdAt: u.created_at,
        avatarUrl: u.avatar_url,
        universityName: u.university_name
      }))
    };
  }

  static async changeUserRole(userId: string, role: string): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  }

  static async suspendUser(userId: string, reason?: string): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/suspend`, { reason });
  }

  static async restoreUser(userId: string): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/restore`);
  }

  static async getAuditLogs(page = 1, limit = 30): Promise<{ auditLogs: AuditLogItem[]; total: number }> {
    const response = await apiClient.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    const { auditLogs, total } = response.data.data;
    return {
      total,
      auditLogs: (auditLogs || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id,
        details: l.details,
        createdAt: l.created_at,
        reason: l.reason,
        admin: l.admin ? { fullName: l.admin.full_name || l.admin.fullName, username: l.admin.username, role: l.admin.role } : null,
        resource: l.resource
      }))
    };
  }

  static async sendAnnouncement(title: string, message: string, targetRole?: string): Promise<{ notified: number }> {
    const response = await apiClient.post('/admin/announcements', { title, message, targetRole: targetRole || 'ALL' });
    return response.data.data;
  }

  static async deleteResource(id: string, reason?: string): Promise<void> {
    await apiClient.delete(`/admin/resources/${id}`, { data: { reason } });
  }

  static async getContactRequests(status = 'ALL'): Promise<ContactInquiry[]> {
    const response = await apiClient.get(`/admin/contact-requests?status=${encodeURIComponent(status)}`);
    return (response.data.data.inquiries || []).map((item: any) => ({
      id: item.id, fullName: item.full_name, email: item.email, category: item.category,
      subject: item.subject, message: item.message, resourceUrl: item.resource_url,
      status: item.status, emailStatus: item.email_status, createdAt: item.created_at
    }));
  }

  static async updateContactStatus(id: string, status: ContactInquiry['status']): Promise<void> {
    await apiClient.patch(`/admin/contact-requests/${id}/status`, { status });
  }
}

// ── My Uploads Service ────────────────────────────────────────────────────────
export class MyUploadsService {
  static async getMyUploads(): Promise<UserUpload[]> {
    const response = await apiClient.get('/resources/my-uploads');
    return (response.data.data.resources || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt || r.created_at,
      category: r.categoryName ? { name: r.categoryName } : r.category,
      course: r.courseCode ? { code: r.courseCode, title: r.courseTitle } : r.course,
      departmentName: r.departmentName,
      semesterName: r.semesterName,
      fileSizeFormatted: r.fileSizeFormatted,
      fileType: r.fileType,
      tags: r.tags || []
    }));
  }

  static async deleteMyUpload(id: string): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  }
}

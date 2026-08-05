import { apiClient } from './apiClient';

export interface DashboardMetricsData {
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
  };
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

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetricsData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  static async getLeaderboard(): Promise<any[]> {
    const response = await apiClient.get('/dashboard/leaderboard');
    return response.data.data.leaderboard;
  }
}

import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getDashboardMetrics();
      return res.status(200).json({
        success: true,
        message: 'Dashboard metrics loaded dynamically.',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();
      return res.status(200).json({
        success: true,
        message: 'Top contributor leaderboard retrieved.',
        data: { leaderboard: metrics.leaderboard }
      });
    } catch (error) {
      next(error);
    }
  }
}

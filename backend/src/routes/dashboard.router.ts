import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/', DashboardController.getDashboard);
router.get('/leaderboard', DashboardController.getLeaderboard);

export default router;

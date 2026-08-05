import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Register API Domain Modules
router.use('/auth', authRoutes);

export default router;

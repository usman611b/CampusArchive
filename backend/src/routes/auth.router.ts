import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

// Rate limiter for authentication endpoints (5 requests per minute)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 60 seconds.',
    data: null
  }
});

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', authenticateJwt, AuthController.getMe);
router.put('/profile', authenticateJwt, AuthController.updateProfile);

export default router;

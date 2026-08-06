import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 60 seconds.',
    data: null
  }
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many account creation attempts. Please try again later.',
    data: null
  }
});

router.post('/register', registrationLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.get('/me', authenticateJwt, AuthController.getMe);
router.put('/profile', authenticateJwt, AuthController.updateProfile);
router.patch('/password', authenticateJwt, loginLimiter, AuthController.changePassword);
router.delete('/me', authenticateJwt, AuthController.deleteMe);

export default router;

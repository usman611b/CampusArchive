import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ContactController } from '../controllers/contact.controller';
import { optionalAuthenticateJwt } from '../middlewares/auth.middleware';

const router = Router();
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact requests. Please try again later.', data: null }
});

router.post('/', contactLimiter, optionalAuthenticateJwt, ContactController.create);

export default router;

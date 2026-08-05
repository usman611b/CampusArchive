import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { InteractionController } from '../controllers/interaction.controller';
import { authenticateJwt, optionalAuthenticateJwt } from '../middlewares/auth.middleware';

const router = Router();
const writeLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

router.post('/ratings', authenticateJwt, writeLimiter, InteractionController.createRating);
router.patch('/ratings/:id', authenticateJwt, writeLimiter, InteractionController.updateRating);
router.delete('/ratings/:id', authenticateJwt, writeLimiter, InteractionController.deleteRating);
router.post('/comments', authenticateJwt, writeLimiter, InteractionController.createComment);
router.patch('/comments/:id', authenticateJwt, writeLimiter, InteractionController.updateComment);
router.delete('/comments/:id', authenticateJwt, writeLimiter, InteractionController.deleteComment);
router.post('/comments/:id/likes', authenticateJwt, writeLimiter, InteractionController.toggleLike);
router.patch('/resources/:id/comments/lock', authenticateJwt, InteractionController.lockComments);
router.get('/resources/:id/ratings', optionalAuthenticateJwt, InteractionController.getRatings);
router.get('/resources/:id/comments', optionalAuthenticateJwt, InteractionController.getComments);

export default router;

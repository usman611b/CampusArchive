import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ResourceController } from '../controllers/resource.controller';
import { authenticateJwt, optionalAuthenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Upload limit reached (20 files/hour). Please try again later.',
    data: null
  }
});

const discussionLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });
const downloadLimiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });

// Upload Pipeline
router.post('/upload-url', authenticateJwt, uploadLimiter, ResourceController.getUploadUrl);
router.post('/', authenticateJwt, uploadLimiter, ResourceController.createResource);

// My Uploads (authenticated user's own history)
router.get('/my-uploads', authenticateJwt, ResourceController.getMyUploads);

// Course Resources
router.get('/course/:courseId', ResourceController.getCourseResources);

// Course Discussions (Q&A)
router.get('/course/:courseId/comments', ResourceController.getCourseComments);
router.post('/course/:courseId/comments', authenticateJwt, discussionLimiter, ResourceController.postCourseComment);

// Course Contributors
router.get('/course/:courseId/contributors', ResourceController.getCourseContributors);

// Individual Resource
router.get('/:id', optionalAuthenticateJwt, ResourceController.getResourceById);
router.post('/:id/download', authenticateJwt, downloadLimiter, ResourceController.downloadResource);
router.post('/:id/bookmark', authenticateJwt, ResourceController.toggleBookmark);
router.post('/:id/rate', authenticateJwt, ResourceController.rateResource);

// Student: Delete own upload
router.delete('/:id', authenticateJwt, ResourceController.deleteMyResource);

export default router;

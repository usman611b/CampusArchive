import { Router } from 'express';
import { AcademicsController } from '../controllers/academics.controller';
import { ResourceController } from '../controllers/resource.controller';

const router = Router();

router.get('/departments', AcademicsController.getDepartments);
router.get('/departments/:deptId/programs', AcademicsController.getPrograms);
router.get('/programs/:programId/semesters', AcademicsController.getSemesters);
router.get('/programs/:programId/semesters/:semesterId/courses', AcademicsController.getCourses);
router.get('/courses/:id', AcademicsController.getCourseHub);

// Delegate contributors to ResourceController (same data, different mount path)
router.get('/courses/:courseId/contributors', ResourceController.getCourseContributors);

export default router;

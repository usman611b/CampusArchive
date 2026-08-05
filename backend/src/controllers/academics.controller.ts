import { Request, Response, NextFunction } from 'express';
import { AcademicsService } from '../services/academics.service';

export class AcademicsController {
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await AcademicsService.getDepartments();
      return res.status(200).json({
        success: true,
        message: 'Departments retrieved successfully.',
        data: { departments }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const { deptId } = req.params;
      const programs = await AcademicsService.getPrograms(deptId);
      return res.status(200).json({
        success: true,
        message: 'Programs retrieved successfully.',
        data: { programs }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.params;
      const semesters = await AcademicsService.getSemesters(programId);
      return res.status(200).json({
        success: true,
        message: 'Semesters retrieved successfully.',
        data: { semesters }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, semesterId } = req.params;
      const courses = await AcademicsService.getCourses(programId, semesterId);
      return res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully.',
        data: { courses }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseHub(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hubData = await AcademicsService.getCourseHubDetails(id);
      return res.status(200).json({
        success: true,
        message: 'Course Hub retrieved successfully.',
        data: hubData
      });
    } catch (error) {
      next(error);
    }
  }
}

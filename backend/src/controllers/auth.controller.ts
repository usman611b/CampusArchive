import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, deleteAccountSchema } from '../validators/auth.validator';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedInput);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedInput);
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getCurrentUser(userId);
      return res.status(200).json({
        success: true,
        message: 'Current profile retrieved.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedInput = updateProfileSchema.parse(req.body);
      const updatedUser = await AuthService.updateProfile(userId, validatedInput);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteAccountSchema.parse(req.body);
      await AuthService.deleteAccount(req.user!.id, input.currentPassword);
      return res.status(200).json({
        success: true,
        message: 'Account deleted and personal profile data anonymized.',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = changePasswordSchema.parse(req.body);
      await AuthService.changePassword(req.user!.id, input);
      return res.status(200).json({ success: true, message: 'Password changed successfully.', data: null });
    } catch (error) {
      next(error);
    }
  }
}

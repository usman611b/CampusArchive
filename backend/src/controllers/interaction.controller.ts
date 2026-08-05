import { NextFunction, Request, Response } from 'express';
import { InteractionService } from '../services/interaction.service';
import { createCommentSchema, createRatingSchema, lockCommentsSchema, updateCommentSchema, updateRatingSchema } from '../validators/interaction.validator';

const ok = (res: Response, data: any, message = 'Success.', status = 200) => res.status(status).json({ success: true, message, data });

export class InteractionController {
  static async getRatings(req: Request, res: Response, next: NextFunction) { try { return ok(res, await InteractionService.getRatings(req.params.id, req.user?.id)); } catch (e) { next(e); } }
  static async createRating(req: Request, res: Response, next: NextFunction) { try { const body = createRatingSchema.parse(req.body); return ok(res, await InteractionService.createRating(req.user!.id, body.resourceId, body.rating), 'Rating created.', 201); } catch (e) { next(e); } }
  static async updateRating(req: Request, res: Response, next: NextFunction) { try { const body = updateRatingSchema.parse(req.body); return ok(res, await InteractionService.updateRating(req.user!.id, req.user!.role as string, req.params.id, body.rating), 'Rating updated.'); } catch (e) { next(e); } }
  static async deleteRating(req: Request, res: Response, next: NextFunction) { try { return ok(res, await InteractionService.deleteRating(req.user!.id, req.user!.role as string, req.params.id), 'Rating deleted.'); } catch (e) { next(e); } }
  static async getComments(req: Request, res: Response, next: NextFunction) { try { return ok(res, { comments: await InteractionService.getComments(req.params.id, req.user?.id) }); } catch (e) { next(e); } }
  static async createComment(req: Request, res: Response, next: NextFunction) { try { const body = createCommentSchema.parse(req.body); return ok(res, { comment: await InteractionService.createComment(req.user!.id, body.resourceId, body.content, body.parentCommentId) }, 'Comment posted.', 201); } catch (e) { next(e); } }
  static async updateComment(req: Request, res: Response, next: NextFunction) { try { const body = updateCommentSchema.parse(req.body); return ok(res, { comment: await InteractionService.updateComment(req.user!.id, req.params.id, body.content) }, 'Comment updated.'); } catch (e) { next(e); } }
  static async deleteComment(req: Request, res: Response, next: NextFunction) { try { await InteractionService.deleteComment(req.user!.id, req.user!.role as string, req.params.id); return ok(res, null, 'Comment deleted.'); } catch (e) { next(e); } }
  static async toggleLike(req: Request, res: Response, next: NextFunction) { try { return ok(res, await InteractionService.toggleLike(req.user!.id, req.params.id)); } catch (e) { next(e); } }
  static async lockComments(req: Request, res: Response, next: NextFunction) { try { const body = lockCommentsSchema.parse(req.body); return ok(res, await InteractionService.lockComments(req.params.id, req.user!.role as string, body.locked)); } catch (e) { next(e); } }
}

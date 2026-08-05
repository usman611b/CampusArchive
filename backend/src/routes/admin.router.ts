import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt, requireRole, requirePermission } from '../middlewares/auth.middleware';
import { Permission } from '@campusarchive/shared';

const router = Router();

// Protect ALL admin routes with JWT Auth + strict non-student Role check
router.use(authenticateJwt);
router.use(requireRole('MODERATOR', 'ADMINISTRATOR', 'SUPER_ADMIN'));

// ── Platform Analytics ─────────────────────────────────────────────────────
router.get('/analytics', requirePermission(Permission.VIEW_ANALYTICS), AdminController.getAnalytics);

// ── Resource Moderation Queue ──────────────────────────────────────────────
router.get('/moderation-queue', requirePermission(Permission.MODERATE_RESOURCES), AdminController.getModerationQueue);
router.put('/resources/:id/approve', requirePermission(Permission.MODERATE_RESOURCES), AdminController.approveResource);
router.put('/resources/:id/reject', requirePermission(Permission.MODERATE_RESOURCES), AdminController.rejectResource);
router.put('/resources/:id/feature', requirePermission(Permission.MODERATE_RESOURCES), AdminController.featureResource);

// ── User Management ────────────────────────────────────────────────────────
router.get('/users', requirePermission(Permission.MANAGE_USERS), AdminController.getUsers);
router.get('/users/:id', requirePermission(Permission.MANAGE_USERS), AdminController.getUserById);
router.patch('/users/:id/role', requirePermission(Permission.MANAGE_USERS), AdminController.changeUserRole);
router.patch('/users/:id/suspend', requirePermission(Permission.MANAGE_USERS), AdminController.suspendUser);
router.patch('/users/:id/restore', requirePermission(Permission.MANAGE_USERS), AdminController.restoreUser);
router.delete('/users/:id', requirePermission(Permission.MANAGE_ADMINS), AdminController.softDeleteUser);

// ── Audit Logs (SUPER_ADMIN & ADMINISTRATOR) ──────────────────────────────
router.get('/audit-logs', requirePermission(Permission.VIEW_AUDIT_LOGS), AdminController.getAuditLogs);

// ── Announcements / Notifications Broadcast ───────────────────────────────
router.post('/announcements', requirePermission(Permission.SEND_ANNOUNCEMENTS), AdminController.sendAnnouncement);

// ── Resource Deletion (Admin can delete any resource) ─────────────────────
router.delete('/resources/:id', requirePermission(Permission.MODERATE_RESOURCES), AdminController.deleteResource);

export default router;

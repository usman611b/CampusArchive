import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import sanitizeHtml from 'sanitize-html';
import { supabase } from '../config/database';
import { env } from '../config/env';
import { EmailService } from '../services/email.service';
import { contactRequestSchema, contactStatusSchema } from '../validators/contact.validator';

const clean = (value: string) => sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} }).trim();

export class ContactController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = contactRequestSchema.parse(req.body);
      // Honeypot submissions receive a normal response but are not persisted.
      if (parsed.website) return res.status(202).json({ success: true, message: 'Your inquiry has been received.', data: null });

      const input = {
        fullName: clean(parsed.fullName), email: parsed.email, category: parsed.category,
        subject: clean(parsed.subject), message: clean(parsed.message),
        resourceUrl: parsed.resourceUrl || null
      };
      const ipHash = createHash('sha256').update(`${env.JWT_SECRET}:${req.ip || ''}`).digest('hex');
      const { data, error } = await supabase.from('contact_requests').insert({
        user_id: req.user?.id || null,
        full_name: input.fullName,
        email: input.email,
        category: input.category,
        subject: input.subject,
        message: input.message,
        resource_url: input.resourceUrl,
        status: 'NEW',
        ip_hash: ipHash,
        user_agent: String(req.headers['user-agent'] || '').slice(0, 255),
        email_status: EmailService.configured ? 'PENDING' : 'NOT_CONFIGURED'
      }).select('id, created_at').single();
      if (error) throw error;

      if (EmailService.configured) {
        EmailService.deliverContact({ id: data.id, ...input, resourceUrl: input.resourceUrl || undefined })
          .then(() => supabase.from('contact_requests').update({ email_status: 'SENT', email_sent_at: new Date().toISOString() }).eq('id', data.id))
          .catch(() => supabase.from('contact_requests').update({ email_status: 'FAILED' }).eq('id', data.id));
      }

      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been received. Our support team will review it.',
        data: { referenceId: data.id, createdAt: data.created_at }
      });
    } catch (error) { next(error); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.query.status || 'ALL');
      let query = supabase.from('contact_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100);
      if (status !== 'ALL') query = query.eq('status', status);
      const { data, error, count } = await query;
      if (error) throw error;
      return res.json({ success: true, message: 'Support inquiries retrieved.', data: { inquiries: data || [], total: count || 0 } });
    } catch (error) { next(error); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = contactStatusSchema.parse(req.body);
      const { data, error } = await supabase.from('contact_requests').update({
        status,
        resolved_by: status === 'RESOLVED' ? req.user!.id : null,
        resolved_at: status === 'RESOLVED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }).eq('id', req.params.id).select('id, status').single();
      if (error) throw error;
      return res.json({ success: true, message: 'Inquiry status updated.', data: { inquiry: data } });
    } catch (error) { next(error); }
  }
}

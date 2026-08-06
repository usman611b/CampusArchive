import { env } from '../config/env';

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export class EmailService {
  static get configured() { return Boolean(env.RESEND_API_KEY); }

  private static async send(payload: Record<string, unknown>, idempotencyKey: string) {
    if (!env.RESEND_API_KEY) return false;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`EMAIL_PROVIDER_${response.status}`);
    return true;
  }

  static async deliverContact(input: {
    id: string; fullName: string; email: string; category: string;
    subject: string; message: string; resourceUrl?: string;
  }) {
    const safe = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, escapeHtml(String(value || ''))]));
    await this.send({
      from: env.EMAIL_FROM,
      to: [env.SUPPORT_EMAIL],
      reply_to: input.email,
      subject: `[CampusArchive ${input.category}] ${input.subject}`,
      html: `<h2>New CampusArchive inquiry</h2><p><strong>Reference:</strong> ${safe.id}</p><p><strong>From:</strong> ${safe.fullName} (${safe.email})</p><p><strong>Category:</strong> ${safe.category}</p><p><strong>Subject:</strong> ${safe.subject}</p><p style="white-space:pre-wrap">${safe.message}</p>${input.resourceUrl ? `<p><strong>Resource:</strong> ${safe.resourceUrl}</p>` : ''}`,
      text: `Reference: ${input.id}\nFrom: ${input.fullName} <${input.email}>\nCategory: ${input.category}\nSubject: ${input.subject}\n\n${input.message}${input.resourceUrl ? `\n\nResource: ${input.resourceUrl}` : ''}`
    }, `contact-support-${input.id}`);

    await this.send({
      from: env.EMAIL_FROM,
      to: [input.email],
      reply_to: env.SUPPORT_EMAIL,
      subject: `We received your CampusArchive inquiry (${input.id.slice(0, 8)})`,
      html: `<p>Hello ${safe.fullName},</p><p>We received your message and will review it shortly.</p><p><strong>Reference:</strong> ${safe.id}</p><p><strong>Subject:</strong> ${safe.subject}</p><p>You can reply to this email to contact our support team.</p>`,
      text: `Hello ${input.fullName},\n\nWe received your CampusArchive inquiry.\nReference: ${input.id}\nSubject: ${input.subject}\n\nYou can reply to this email to contact support.`
    }, `contact-confirmation-${input.id}`);
    return true;
  }
}

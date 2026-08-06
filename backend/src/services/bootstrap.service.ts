import { supabase } from '../config/database';
import { env } from '../config/env';

export class BootstrapService {
  /**
   * Safe One-Time First Admin Bootstrap
   * Automatically promotes the specified FIRST_ADMIN_EMAIL user to ADMINISTRATOR
   * when starting up, eliminating manual SQL queries in production environments.
   */
  static async runBootstrap(): Promise<void> {
    if (!env.ENABLE_FIRST_ADMIN_BOOTSTRAP) return;

    const adminEmail = env.FIRST_ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.trim()) {
      return;
    }

    try {
      // 1. Find user by email
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('email', adminEmail.trim().toLowerCase())
        .maybeSingle();

      if (userError || !targetUser) {
        console.log(`[BOOTSTRAP] First admin email '${adminEmail}' not registered yet. Bootstrap pending account creation.`);
        return;
      }

      // 2. Check if already ADMINISTRATOR or SUPER_ADMIN
      if (targetUser.role === 'ADMINISTRATOR' || targetUser.role === 'SUPER_ADMIN') {
        console.log(`[BOOTSTRAP] Account '${adminEmail}' is already ${targetUser.role}. Bootstrap bypassed.`);
        return;
      }

      // 3. Promote to ADMINISTRATOR (compatible with PostgreSQL user_role enum)
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'ADMINISTRATOR', updated_at: new Date().toISOString() })
        .eq('id', targetUser.id);

      if (updateError) {
        console.error(`[BOOTSTRAP ERROR] Failed to promote ${adminEmail}:`, updateError.message);
        return;
      }

      // 4. Log audit record
      try {
        await supabase.from('audit_logs').insert({
          admin_id: targetUser.id,
          action: 'FIRST_ADMIN_BOOTSTRAP_EXECUTED',
          target_type: 'user',
          target_id: targetUser.id,
          details: { email: adminEmail, promotedTo: 'ADMINISTRATOR' }
        });
      } catch (e) {}

      console.log(`[BOOTSTRAP SUCCESS] Account '${adminEmail}' (${targetUser.full_name}) successfully promoted to ADMINISTRATOR.`);
    } catch (err: any) {
      console.error('[BOOTSTRAP EXCEPTION]', err?.message || err);
    }
  }
}

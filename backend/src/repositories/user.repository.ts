import { supabase } from '../config/database';
import { RegisterInput, UpdateProfileInput } from '../validators/auth.validator';

export class UserRepository {
  static async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createUser(input: RegisterInput & { passwordHash: string; role?: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email.toLowerCase(),
        password_hash: input.passwordHash,
        full_name: input.fullName,
        username: input.username.toLowerCase(),
        role: input.role || 'STUDENT',
        university_name: input.universityName || 'Lahore Garrison University',
        department_id: input.departmentId || null,
        program_id: input.programId || null,
        semester_id: input.semesterId || null
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize contributor metrics
    try {
      await supabase.from('contributor_metrics').insert({
        user_id: data.id,
        karma_score: 0
      });
    } catch (e) {}

    return data;
  }

  static async updateUser(id: string, input: UpdateProfileInput & { role?: string }) {
    const updatePayload: any = {};
    if (input.fullName) updatePayload.full_name = input.fullName;
    if (input.username) updatePayload.username = input.username.toLowerCase();
    if (input.universityName) updatePayload.university_name = input.universityName;
    if (input.departmentId) updatePayload.department_id = input.departmentId;
    if (input.programId) updatePayload.program_id = input.programId;
    if (input.semesterId) updatePayload.semester_id = input.semesterId;
    if (input.bio !== undefined) updatePayload.bio = input.bio;
    if (input.avatarUrl) updatePayload.avatar_url = input.avatarUrl;
    if (input.role) updatePayload.role = input.role;

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getKarmaScore(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('contributor_metrics')
      .select('karma_score')
      .eq('user_id', userId)
      .single();

    if (error || !data) return 0;
    return data.karma_score || 0;
  }

  static async anonymizeAndDelete(userId: string): Promise<void> {
    const deletedIdentity = `deleted_${userId.replace(/-/g, '')}`;
    const { error } = await supabase
      .from('users')
      .update({
        email: `${deletedIdentity}@deleted.invalid`,
        username: deletedIdentity,
        full_name: 'Deleted User',
        password_hash: 'ACCOUNT_DELETED',
        avatar_url: null,
        bio: null,
        is_suspended: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .is('deleted_at', null);

    if (error) throw error;
  }

  static async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .is('deleted_at', null);
    if (error) throw error;
  }
}

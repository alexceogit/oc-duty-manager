// ============================================
// SUPABASE CLIENT
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      personnel: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          main_role: string;
          sub_role: string | null;
          seniority: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['personnel']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['personnel']['Insert']>;
      };
      leaves: {
        Row: {
          id: string;
          personnel_id: string;
          leave_type: string;
          start_date: string;
          end_date: string;
          start_time: string | null;
          end_time: string | null;
          is_approved: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leaves']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leaves']['Insert']>;
      };
      duty_assignments: {
        Row: {
          id: string;
          personnel_id: string;
          location: string;
          shift: string | null;
          date: string;
          is_manual: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['duty_assignments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['duty_assignments']['Insert']>;
      };
    };
  };
}

// Helper functions
export const supabaseHelpers = {
  // Test connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    try {
      const { error } = await supabase.from('personnel').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Personnel operations
  async getPersonnel() {
    if (!supabase) return { data: [], error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('is_active', true)
      .order('last_name');
    return { data, error };
  },

  async addPersonnel(person: any) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('personnel').insert(person);
    return { error };
  },

  async updatePersonnel(id: string, updates: any) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('personnel')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    return { error };
  },

  async deletePersonnel(id: string) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('personnel')
      .update({ is_active: false })
      .eq('id', id);
    return { error };
  },

  // Leave operations
  async getLeaves(startDate?: string, endDate?: string) {
    if (!supabase) return { data: [], error: 'Supabase not configured' };
    let query = supabase.from('leaves').select('*').eq('is_approved', true);
    if (startDate) query = query.gte('end_date', startDate);
    if (endDate) query = query.lte('start_date', endDate);
    const { data, error } = await query;
    return { data, error };
  },

  async addLeave(leave: any) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('leaves').insert(leave);
    return { error };
  },

  // Duty operations
  async getDuties(date?: string) {
    if (!supabase) return { data: [], error: 'Supabase not configured' };
    let query = supabase.from('duty_assignments').select('*');
    if (date) query = query.eq('date', date);
    const { data, error } = await query;
    return { data, error };
  },

  async addDuty(duty: any) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('duty_assignments').insert(duty);
    return { error };
  },

  async updateDuty(id: string, updates: any) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('duty_assignments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    return { error };
  },

  async deleteDuty(id: string) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.from('duty_assignments').delete().eq('id', id);
    return { error };
  },

  // Clear all duties for a date
  async clearDutiesForDate(date: string) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase
      .from('duty_assignments')
      .delete()
      .eq('date', date)
      .eq('is_manual', false); // Only clear auto-assigned duties
    return { error };
  }
};

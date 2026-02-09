// ============================================
// CONFIG - Environment variables
// ============================================

// Supabase configuration
// These should be set in .env file or environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// App configuration
export const appName = 'Nöbet Yönetim Sistemi';
export const appVersion = '1.0.0';

// Feature flags
export const features = {
  enableAuth: true,
  enableAutoSchedule: true,
  enableExport: true,
};

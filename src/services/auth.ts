// ============================================
// AUTH SERVICE - Supabase Authentication
// ============================================

import { createClient } from '@supabase/supabase-js';
import type { Session, AuthError } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from '../config';

export const supabaseAuth = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Types for auth
export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

// Auth state type
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

// Helper to get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabaseAuth) return null;
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    emailConfirmed: user.email_confirmed_at !== null,
    createdAt: new Date(user.created_at)
  };
}

// Helper to get session
export async function getSession(): Promise<Session | null> {
  if (!supabaseAuth) return null;
  
  const { data: { session } } = await supabaseAuth.auth.getSession();
  return session;
}

// Sign in with email/password
export async function signInWithPassword(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  if (!supabaseAuth) {
    return { user: null, error: { name: 'NoAuth', message: 'Supabase not configured', status: 500, __isAuthError: true } as unknown as AuthError };
  }
  
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    return { user: null, error };
  }
  
  return {
    user: data.user ? {
      id: data.user.id,
      email: data.user.email || '',
      emailConfirmed: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at)
    } : null,
    error: null
  };
}

// Sign up with email/password
export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  if (!supabaseAuth) {
    return { user: null, error: { name: 'NoAuth', message: 'Supabase not configured', status: 500, __isAuthError: true } as unknown as AuthError };
  }
  
  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    return { user: null, error };
  }
  
  return {
    user: data.user ? {
      id: data.user.id,
      email: data.user.email || '',
      emailConfirmed: data.user.email_confirmed_at !== null,
      createdAt: new Date(data.user.created_at)
    } : null,
    error: null
  };
}

// Sign out
export async function signOut(): Promise<void> {
  if (!supabaseAuth) return;
  await supabaseAuth.auth.signOut();
}

// Reset password (send reset email)
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { name: 'NoAuth', message: 'Supabase not configured', status: 500, __isAuthError: true } as unknown as AuthError };
  }
  
  const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  return { error };
}

// Update password
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  if (!supabaseAuth) {
    return { error: { name: 'NoAuth', message: 'Supabase not configured', status: 500, __isAuthError: true } as unknown as AuthError };
  }
  
  const { error } = await supabaseAuth.auth.updateUser({
    password: newPassword
  });
  
  return { error };
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (event: string, session: Session | null) => void): () => void {
  if (!supabaseAuth) {
    return () => {};
  }
  
  const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return () => subscription.unsubscribe();
}

// Get ID token for RLS policies
export async function getIdToken(): Promise<string | null> {
  if (!supabaseAuth) return null;
  
  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session) return null;
  
  return session.access_token;
}

// Refresh session
export async function refreshSession(): Promise<Session | null> {
  if (!supabaseAuth) return null;
  
  const { data: { session }, error } = await supabaseAuth.auth.refreshSession();
  if (error) {
    console.error('Session refresh error:', error);
    return null;
  }
  
  return session;
}

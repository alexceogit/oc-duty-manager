// ============================================
// AUTH CONTEXT - Global authentication state
// ============================================

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Session, AuthError } from '@supabase/supabase-js';
import type { AuthUser } from '../services/auth';
import { 
  getCurrentUser, 
  getSession, 
  signInWithPassword, 
  signUp as authSignUp, 
  signOut as authSignOut, 
  onAuthStateChange
} from '../services/auth';

// Auth state interface
interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  initialized: boolean;
}

// Action types
type AuthAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET' };

// Initial state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context interface
interface AuthContextType {
  state: AuthState;
  // Auth operations
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  // Utility
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    async function initAuth() {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const user = await getCurrentUser();
        const session = await getSession();
        
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_SESSION', payload: session });
      } catch (err) {
        console.error('Auth initialization error:', err);
        dispatch({ type: 'SET_ERROR', payload: err as AuthError });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    }

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          emailConfirmed: session.user.email_confirmed_at !== null,
          createdAt: new Date(session.user.created_at)
        };
        dispatch({ type: 'SET_USER', payload: authUser });
        dispatch({ type: 'SET_SESSION', payload: session });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_SESSION', payload: null });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        dispatch({ type: 'SET_SESSION', payload: session });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in
  async function signIn(email: string, password: string): Promise<{ error: AuthError | null }> {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const { user, error } = await signInWithPassword(email, password);
    
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { error };
    }
    
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return { error: null };
  }

  // Sign up
  async function signUp(email: string, password: string): Promise<{ error: AuthError | null }> {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const { user, error } = await authSignUp(email, password);
    
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: error });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { error };
    }
    
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return { error: null };
  }

  // Sign out
  async function signOut() {
    await authSignOut();
    dispatch({ type: 'RESET' });
  }

  // Clear error
  function clearError() {
    dispatch({ type: 'SET_ERROR', payload: null });
  }

  const value: AuthContextType = {
    state,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.email?.includes('admin') || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

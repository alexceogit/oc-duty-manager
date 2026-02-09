// ============================================
// APP CONTEXT - Global state management
// ============================================

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Personnel, Leave, DutyAssignment, AlgorithmSettings, ShiftType } from '../types';
import { supabase, supabaseHelpers } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';

// Default algorithm settings
const defaultSettings: AlgorithmSettings = {
  allowMultipleDutiesPerDay: true,        // NEW RULE: Allow 2 duties per day
  maxDutiesPerDayNormal: 2,               // Normal personnel: max 2 duties
  maxDutiesPerDaySenior: 1,               // Senior personnel: max 1 duty
  priorityOrder: ['Normal', 'Kıdemli', 'Dede'],
  excludeSubRoles: ['Haberci', 'Santral'], // Not included in auto-schedule
  nightShiftPriority: ['Normal', 'Kıdemli', 'Dede']
};

// State interface
interface AppState {
  personnel: Personnel[];
  leaves: Leave[];
  duties: DutyAssignment[];
  settings: AlgorithmSettings;
  currentDate: Date;
  isLoading: boolean;
  error: string | null;
  supabaseConnected: boolean;
}

// Action types
type Action =
  | { type: 'SET_PERSONNEL'; payload: Personnel[] }
  | { type: 'ADD_PERSONNEL'; payload: Personnel }
  | { type: 'UPDATE_PERSONNEL'; payload: Personnel }
  | { type: 'DELETE_PERSONNEL'; payload: string }
  | { type: 'SET_LEAVES'; payload: Leave[] }
  | { type: 'ADD_LEAVE'; payload: Leave }
  | { type: 'SET_DUTIES'; payload: DutyAssignment[] }
  | { type: 'ADD_DUTY'; payload: DutyAssignment }
  | { type: 'UPDATE_DUTY'; payload: DutyAssignment }
  | { type: 'DELETE_DUTY'; payload: string }
  | { type: 'SET_DUTIES_FOR_DATE'; payload: { date: string; duties: DutyAssignment[] } }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUPABASE_STATUS'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial state - Empty arrays, no mock data
const initialState: AppState = {
  personnel: [],
  leaves: [],
  duties: [],
  settings: defaultSettings,
  currentDate: new Date(),
  isLoading: false,
  error: null,
  supabaseConnected: false
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PERSONNEL':
      return { ...state, personnel: action.payload };
    case 'ADD_PERSONNEL':
      return { ...state, personnel: [...state.personnel, action.payload] };
    case 'UPDATE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.map(p =>
          p.id === action.payload ? { ...p, isActive: false } : p
        )
      };
    case 'SET_LEAVES':
      return { ...state, leaves: action.payload };
    case 'ADD_LEAVE':
      return { ...state, leaves: [...state.leaves, action.payload] };
    case 'SET_DUTIES':
      return { ...state, duties: action.payload };
    case 'ADD_DUTY':
      return { ...state, duties: [...state.duties, action.payload] };
    case 'UPDATE_DUTY':
      return {
        ...state,
        duties: state.duties.map(d =>
          d.id === action.payload.id ? action.payload : d
        )
      };
    case 'DELETE_DUTY':
      return {
        ...state,
        duties: state.duties.filter(d => d.id !== action.payload)
      };
    case 'SET_DUTIES_FOR_DATE':
      const dateStr = new Date(action.payload.date).toISOString().split('T')[0];
      const otherDuties = state.duties.filter(d => 
        new Date(d.date).toISOString().split('T')[0] !== dateStr
      );
      return { ...state, duties: [...otherDuties, ...action.payload.duties] };
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUPABASE_STATUS':
      return { ...state, supabaseConnected: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // CRUD operations
  addPersonnel: (person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  addLeave: (leave: Omit<Leave, 'id' | 'createdAt'>) => void;
  addDuty: (duty: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDuty: (id: string, updates: Partial<DutyAssignment>) => void;
  deleteDuty: (id: string) => void;
  // Algorithm
  runAutoSchedule: (date: Date) => void;
  clearAutoSchedule: (date: Date) => void;
  // Date navigation
  setCurrentDate: (date: Date) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// Helper function to convert camelCase to snake_case
function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
    result[snakeKey] = camelToSnake(obj[key]);
  }
  return result;
}

// Helper function to convert snake_case to camelCase
function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
  }
  return result;
}

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize Supabase data on mount
  useEffect(() => {
    async function initSupabase() {
      if (supabase) {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Test connection
        const connection = await supabaseHelpers.testConnection();
        dispatch({ type: 'SET_SUPABASE_STATUS', payload: connection.success });

        if (connection.success) {
          // Load personnel
          const { data: personnel, error: pError } = await supabaseHelpers.getPersonnel();
          if (!pError && personnel) {
            dispatch({ type: 'SET_PERSONNEL', payload: snakeToCamel(personnel) as any });
          }

          // Load leaves for current month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
          const { data: leaves } = await supabaseHelpers.getLeaves(startOfMonth, endOfMonth);
          if (leaves) {
            dispatch({ type: 'SET_LEAVES', payload: snakeToCamel(leaves) as any });
          }

          // Load duties for current date
          const today = now.toISOString().split('T')[0];
          const { data: duties } = await supabaseHelpers.getDuties(today);
          if (duties) {
            dispatch({ type: 'SET_DUTIES', payload: snakeToCamel(duties) as any });
          }
        } else {
          // No Supabase data - start with empty state
          console.log('📦 Starting with empty data (no mock data)');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        // No Supabase configured - start with empty state
        console.log('📦 Starting with empty data (no Supabase configured)');
        dispatch({ type: 'SET_SUPABASE_STATUS', payload: false });
      }
    }

    initSupabase();
  }, []);

  // CRUD Operations
  function addPersonnel(person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPerson: Personnel = {
      ...person,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_PERSONNEL', payload: newPerson });
    supabaseHelpers.addPersonnel(camelToSnake({ ...newPerson, created_at: newPerson.createdAt.toISOString(), updated_at: newPerson.updatedAt.toISOString() }));
  }

  function updatePersonnel(id: string, updates: Partial<Personnel>) {
    const updatedPerson = { ...updates, id, updatedAt: new Date() } as Personnel;
    dispatch({ type: 'UPDATE_PERSONNEL', payload: updatedPerson });
    supabaseHelpers.updatePersonnel(id, camelToSnake({ ...updates, updated_at: new Date().toISOString() }));
  }

  function deletePersonnel(id: string) {
    dispatch({ type: 'DELETE_PERSONNEL', payload: id });
    supabaseHelpers.deletePersonnel(id);
  }

  function addLeave(leave: Omit<Leave, 'id' | 'createdAt'>) {
    const newLeave: Leave = {
      ...leave,
      id: uuidv4(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_LEAVE', payload: newLeave });
    supabaseHelpers.addLeave(camelToSnake({ ...newLeave, created_at: newLeave.createdAt.toISOString() }));
  }

  function addDuty(duty: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>) {
    const newDuty: DutyAssignment = {
      ...duty,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_DUTY', payload: newDuty });
    supabaseHelpers.addDuty(camelToSnake({ ...newDuty, created_at: newDuty.createdAt.toISOString(), updated_at: newDuty.updatedAt.toISOString() }));
  }

  function updateDuty(id: string, updates: Partial<DutyAssignment>) {
    const updatedDuty = { ...updates, id, updatedAt: new Date() } as DutyAssignment;
    dispatch({ type: 'UPDATE_DUTY', payload: updatedDuty });
    supabaseHelpers.updateDuty(id, camelToSnake({ ...updates, updated_at: new Date().toISOString() }));
  }

  function deleteDuty(id: string) {
    dispatch({ type: 'DELETE_DUTY', payload: id });
    supabaseHelpers.deleteDuty(id);
  }

  function setCurrentDate(date: Date) {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  }

  // Auto-schedule algorithm with new shift structure
  function runAutoSchedule(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get available personnel for this date
    const availablePersonnel = state.personnel.filter(p => {
      if (!p.isActive) return false;
      
      // Check if on leave
      const onLeave = state.leaves.some(l => {
        if (l.personnelId !== p.id) return false;
        const leaveStart = new Date(l.startDate);
        const leaveEnd = new Date(l.endDate);
        const checkDate = new Date(dateStr);
        return checkDate >= leaveStart && checkDate <= leaveEnd;
      });
      
      if (onLeave) return false;
      
      // NEW RULE: Normal personnel can have 2 duties, seniors 1
      const existingDuties = state.duties.filter(d => 
        d.personnelId === p.id && new Date(d.date).toISOString().split('T')[0] === dateStr
      );
      
      const maxDuties = p.seniority === 'Normal' 
        ? state.settings.maxDutiesPerDayNormal 
        : state.settings.maxDutiesPerDaySenior;
      
      return existingDuties.length < maxDuties;
    });

    // Sort by seniority priority
    availablePersonnel.sort((a, b) => {
      const priority = state.settings.priorityOrder;
      return priority.indexOf(a.seniority) - priority.indexOf(b.seniority);
    });

    // Create auto assignments for Çapraz, Kaya1, Kaya2
    const locations = ['Çapraz', 'Kaya1', 'Kaya2'] as const;
    const shifts: ShiftType[] = ['Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2'];
    
    // Gece shifts have 2 people (except Çapraz)
    const personnelPerShift: Record<string, number> = {
      'Çapraz': 1,
      'Kaya1': 1,
      'Kaya2': 1,
      'Gece 1': 2,  // 2 people at night
      'Gece 2': 2   // 2 people at night
    };

    const newDuties: DutyAssignment[] = [];

    locations.forEach(location => {
      shifts.forEach(shift => {
        const count = personnelPerShift[shift] || 1;
        const assignedIds = newDuties
          .filter(d => d.location === location && d.shift === shift && new Date(d.date).toISOString().split('T')[0] === dateStr)
          .map(d => d.personnelId);

        // Find available personnel for this shift
        const eligible = availablePersonnel.filter(p => {
          if (assignedIds.includes(p.id)) return false;
          if (p.subRole && state.settings.excludeSubRoles.includes(p.subRole)) return false;
          if (p.seniority === 'Dede' && (shift === 'Gece 1' || shift === 'Gece 2')) return false;
          return true;
        });

        // 18:00-22:00 Special Rule: Çavuş + 1 Er
        if (shift === 'Akşam 1') {
          const cavus = eligible.find(p => p.mainRole === 'Çavuş');
          if (cavus) {
            newDuties.push({
              id: uuidv4(),
              personnelId: cavus.id,
              location,
              shift,
              date: new Date(dateStr),
              isManual: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });

            const er = eligible.find(p => p.mainRole === 'Er');
            if (er) {
              newDuties.push({
                id: uuidv4(),
                personnelId: er.id,
                location,
                shift,
                date: new Date(dateStr),
                isManual: false,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        } else {
          // Normal assignment
          for (let i = 0; i < count && eligible.length > 0; i++) {
            const person = eligible.shift()!;
            newDuties.push({
              id: uuidv4(),
              personnelId: person.id,
              location,
              shift,
              date: new Date(dateStr),
              isManual: false,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      });
    });

    // Add all new duties
    newDuties.forEach(duty => {
      dispatch({ type: 'ADD_DUTY', payload: duty });
      supabaseHelpers.addDuty({ ...duty, created_at: duty.createdAt.toISOString(), updated_at: duty.updatedAt.toISOString() });
    });
  }

  function clearAutoSchedule(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    const autoDuties = state.duties.filter(d => new Date(d.date).toISOString().split('T')[0] === dateStr && !d.isManual);
    
    autoDuties.forEach(duty => {
      dispatch({ type: 'DELETE_DUTY', payload: duty.id });
      supabaseHelpers.deleteDuty(duty.id);
    });
  }

  const value: AppContextType = {
    state,
    dispatch,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
    addLeave,
    addDuty,
    updateDuty,
    deleteDuty,
    runAutoSchedule,
    clearAutoSchedule,
    setCurrentDate
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

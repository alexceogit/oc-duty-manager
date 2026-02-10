// ============================================
// APP CONTEXT - Global state management
// ============================================

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Personnel, Leave, DutyAssignment, AlgorithmSettings, ShiftType, PersonnelExemption, DutyLocation } from '../types';
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
  exemptions: PersonnelExemption[];
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
  | { type: 'SET_EXEMPTIONS'; payload: PersonnelExemption[] }
  | { type: 'ADD_EXEMPTION'; payload: PersonnelExemption }
  | { type: 'UPDATE_EXEMPTION'; payload: PersonnelExemption }
  | { type: 'DELETE_EXEMPTION'; payload: string }
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
  exemptions: [],
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
    case 'SET_EXEMPTIONS':
      return { ...state, exemptions: action.payload };
    case 'ADD_EXEMPTION':
      return { ...state, exemptions: [...state.exemptions, action.payload] };
    case 'UPDATE_EXEMPTION':
      return {
        ...state,
        exemptions: state.exemptions.map(e =>
          e.id === action.payload.id ? action.payload : e
        )
      };
    case 'DELETE_EXEMPTION':
      return {
        ...state,
        exemptions: state.exemptions.filter(e => e.id !== action.payload)
      };
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
  // Exemption CRUD
  addExemption: (exemption: Omit<PersonnelExemption, 'id' | 'createdAt'>) => void;
  updateExemption: (id: string, updates: Partial<PersonnelExemption>) => void;
  deleteExemption: (id: string) => void;
  // Algorithm
  runAutoSchedule: (date: Date) => void;
  clearAutoSchedule: (date: Date) => void;
  // Date navigation
  setCurrentDate: (date: Date) => void;
  // Data refresh
  refreshData: () => Promise<void>;
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
  // Handle Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
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
  // Handle Date objects - convert from ISO string
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj);
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
          if (pError) console.error('Personnel load error:', pError);
          if (!pError && personnel) {
            dispatch({ type: 'SET_PERSONNEL', payload: snakeToCamel(personnel) as any });
          }

          // Load leaves for current month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
          const { data: leaves, error: lError } = await supabaseHelpers.getLeaves(startOfMonth, endOfMonth);
          if (lError) console.error('Leaves load error:', lError);
          if (leaves) {
            dispatch({ type: 'SET_LEAVES', payload: snakeToCamel(leaves) as any });
          }

          // Load duties for current date
          const today = now.toISOString().split('T')[0];
          const { data: duties, error: dError } = await supabaseHelpers.getDuties(today);
          if (dError) console.error('Duties load error:', dError);
          if (duties) {
            dispatch({ type: 'SET_DUTIES', payload: snakeToCamel(duties) as any });
          }

          // Load exemptions
          const { data: exemptions, error: eError } = await supabaseHelpers.getExemptions();
          if (eError) console.error('Exemptions load error:', eError);
          if (exemptions) {
            dispatch({ type: 'SET_EXEMPTIONS', payload: snakeToCamel(exemptions) as any });
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
  async function addPersonnel(person: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPerson: Personnel = {
      ...person,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_PERSONNEL', payload: newPerson });
    const { error } = await supabaseHelpers.addPersonnel(camelToSnake({ ...newPerson, created_at: newPerson.createdAt.toISOString(), updated_at: newPerson.updatedAt.toISOString() }));
    if (error) console.error('Add personnel error:', error);
  }

  async function updatePersonnel(id: string, updates: Partial<Personnel>) {
    const updatedPerson = { ...updates, id, updatedAt: new Date() } as Personnel;
    dispatch({ type: 'UPDATE_PERSONNEL', payload: updatedPerson });
    const { error } = await supabaseHelpers.updatePersonnel(id, camelToSnake({ ...updates, updated_at: new Date().toISOString() }));
    if (error) console.error('Update personnel error:', error);
  }

  async function deletePersonnel(id: string) {
    dispatch({ type: 'DELETE_PERSONNEL', payload: id });
    const { error } = await supabaseHelpers.deletePersonnel(id);
    if (error) console.error('Delete personnel error:', error);
  }

  async function addLeave(leave: Omit<Leave, 'id' | 'createdAt'>): Promise<void> {
    const newLeave: Leave = {
      ...leave,
      id: uuidv4(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_LEAVE', payload: newLeave });
    const { error } = await supabaseHelpers.addLeave(camelToSnake({ ...newLeave, created_at: newLeave.createdAt.toISOString() }));
    if (error) {
      console.error('Add leave error:', error);
      throw new Error(typeof error === 'string' ? error : error?.message || 'İzin eklenirken hata oluştu');
    }
  }

  async function addDuty(duty: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>) {
    const newDuty: DutyAssignment = {
      ...duty,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_DUTY', payload: newDuty });
    const { error } = await supabaseHelpers.addDuty(camelToSnake({ ...newDuty, created_at: newDuty.createdAt.toISOString(), updated_at: newDuty.updatedAt.toISOString() }));
    if (error) console.error('Add duty error:', error);
  }

  async function updateDuty(id: string, updates: Partial<DutyAssignment>) {
    const updatedDuty = { ...updates, id, updatedAt: new Date() } as DutyAssignment;
    dispatch({ type: 'UPDATE_DUTY', payload: updatedDuty });
    const { error } = await supabaseHelpers.updateDuty(id, camelToSnake({ ...updates, updated_at: new Date().toISOString() }));
    if (error) console.error('Update duty error:', error);
  }

  async function deleteDuty(id: string) {
    dispatch({ type: 'DELETE_DUTY', payload: id });
    const { error } = await supabaseHelpers.deleteDuty(id);
    if (error) console.error('Delete duty error:', error);
  }

  // Exemption CRUD Operations
  async function addExemption(exemption: Omit<PersonnelExemption, 'id' | 'createdAt'>) {
    const newExemption: PersonnelExemption = {
      ...exemption,
      id: uuidv4(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_EXEMPTION', payload: newExemption });
    const { error } = await supabaseHelpers.addExemption(camelToSnake({ ...newExemption, created_at: newExemption.createdAt.toISOString() }));
    if (error) console.error('Add exemption error:', error);
  }

  async function updateExemption(id: string, updates: Partial<PersonnelExemption>) {
    const updatedExemption = { ...updates, id } as PersonnelExemption;
    dispatch({ type: 'UPDATE_EXEMPTION', payload: updatedExemption });
    const { error } = await supabaseHelpers.updateExemption(id, camelToSnake(updates));
    if (error) console.error('Update exemption error:', error);
  }

  async function deleteExemption(id: string) {
    dispatch({ type: 'DELETE_EXEMPTION', payload: id });
    const { error } = await supabaseHelpers.deleteExemption(id);
    if (error) console.error('Delete exemption error:', error);
  }

  function setCurrentDate(date: Date) {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  }

  // Check if personnel has exemption for location or shift
  function hasExemption(personnelId: string, location?: string, shift?: string): boolean {
    return state.exemptions.some(e => {
      if (e.personnelId !== personnelId || !e.isActive) return false;
      
      if (e.exemptionType === 'shift' && shift && e.targetValue === shift) return true;
      if (e.exemptionType === 'location' && location && e.targetValue === location) return true;
      
      // Combined check: shift_location
      if (e.exemptionType === 'shift_location' && shift && location) {
        const [exemptShift, exemptLocation] = (e.targetValue as string).split('|');
        return exemptShift === shift && exemptLocation === location;
      }
      
      return false;
    });
  }

  // Auto-schedule algorithm with location rotation and flexible Akşam 1 rules
  async function runAutoSchedule(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Shift time definitions for 8-hour gap calculation
    const shiftTimes: Record<string, { start: number; end: number }> = {
      'Gündüz 1': { start: 6, end: 12 },
      'Gündüz 2': { start: 12, end: 18 },
      'Akşam 1': { start: 18, end: 22 },
      'Gece 1': { start: 22, end: 2 },
      'Gece 2': { start: 2, end: 6 },
      'Santral Gündüz': { start: 8, end: 20 },
      'Santral Gece': { start: 20, end: 8 }
    };

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
      
      // Existing duties count for today
      const existingDuties = state.duties.filter(d => 
        d.personnelId === p.id && new Date(d.date).toISOString().split('T')[0] === dateStr
      );
      
      const maxDuties = p.seniority === 'Normal' 
        ? state.settings.maxDutiesPerDayNormal 
        : state.settings.maxDutiesPerDaySenior;
      
      return existingDuties.length < maxDuties;
    });

    // Sort by seniority priority (Dede → Kıdemli → Normal)
    const sortedPersonnel = [...availablePersonnel].sort((a, b) => {
      const priority = state.settings.priorityOrder;
      return priority.indexOf(a.seniority) - priority.indexOf(b.seniority);
    });

    // Create auto assignments for Çapraz, Kaya1, Kaya2
    const locations = ['Çapraz', 'Kaya1', 'Kaya2'] as const;
    
    // Personnel count per location and shift
    const getPersonnelCount = (location: string, shift: string): number => {
      // Çapraz: Always 1 person for ALL shifts
      if (location === 'Çapraz') return 1;
      // Kaya1/Kaya2: Gündüz = 1 person, Akşam/Gece = 2 people
      if (shift === 'Gündüz 1' || shift === 'Gündüz 2') return 1;
      return 2; // Akşam 1, Gece 1, Gece 2
    };

    // Helper to check 8-hour gap between shifts
    const has8HourGap = (personnelId: string, newShift: string): boolean => {
      const personDuties = newDuties.filter(d => d.personnelId === personnelId);
      if (personDuties.length === 0) return true;
      
      const newStart = shiftTimes[newShift].start;
      
      for (const duty of personDuties) {
        if (!duty.shift) continue;
        const existingEnd = shiftTimes[duty.shift].end;
        
        let gap: number;
        if (existingEnd > newStart) {
          gap = (24 - existingEnd) + newStart;
        } else {
          gap = newStart - existingEnd;
        }
        
        if (gap < 8) return false;
      }
      return true;
    };

    // Helper to check if person worked at same location in morning shifts
    const workedAtLocationThisMorning = (personnelId: string, location: string): boolean => {
      // Check if person was assigned to this location in Gündüz 1 or Gündüz 2
      return newDuties.some(d => 
        d.personnelId === personnelId && 
        d.location === location &&
        (d.shift === 'Gündüz 1' || d.shift === 'Gündüz 2')
      );
    };

    const newDuties: DutyAssignment[] = [];

    // Sort shifts by time order: Gündüz 1 → Gündüz 2 → Akşam 1 → Gece 1 → Gece 2
    const shiftOrder: ShiftType[] = ['Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2'];

    // Process shifts in order to track assignments
    for (const shift of shiftOrder) {
      for (const location of locations) {
        const count = getPersonnelCount(location, shift);
        const assignedIds = newDuties
          .filter(d => d.location === location && d.shift === shift && new Date(d.date).toISOString().split('T')[0] === dateStr)
          .map(d => d.personnelId);

        // Find eligible personnel for this shift
        let eligible = sortedPersonnel.filter(p => {
          // Already assigned to this location+shift?
          if (assignedIds.includes(p.id)) return false;
          
          // Max duties check
          const personDuties = newDuties.filter(d => d.personnelId === p.id);
          const maxDuties = p.seniority === 'Normal' ? 2 : 1;
          if (personDuties.length >= maxDuties) return false;
          
          // Subrole exclusion
          if (p.subRole && state.settings.excludeSubRoles.includes(p.subRole)) return false;
          
          // Dede night restriction
          if (p.seniority === 'Dede' && (shift === 'Gece 1' || shift === 'Gece 2')) return false;
          
          // Exemptions check
          if (hasExemption(p.id, location, shift)) return false;
          
          // 8-hour gap check
          if (!has8HourGap(p.id, shift)) return false;
          
          // LOCATION ROTATION: Don't assign same person to same location morning + evening
          if ((shift === 'Akşam 1' || shift === 'Gece 1' || shift === 'Gece 2') && 
              workedAtLocationThisMorning(p.id, location)) {
            return false;
          }
          
          return true;
        });

        // === SPECIAL RULES PER SHIFT ===

        if (location === 'Çapraz') {
          // Çapraz: Always 1 person, prioritize Normal Er
          const normalErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Normal');
          const prioritized = [...normalErler, ...eligible.filter(p => !normalErler.includes(p))];
          const selected = prioritized.slice(0, 1);
          
          for (const person of selected) {
            newDuties.push(createDutyAssignment(person.id, location, shift, dateStr));
          }
        }
        else if (shift === 'Gündüz 1' || shift === 'Gündüz 2') {
          // Gündüz: Prioritize Normal Er
          const normalErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Normal');
          const prioritized = [...normalErler, ...eligible.filter(p => !normalErler.includes(p))];
          const selected = prioritized.slice(0, count);
          
          for (const person of selected) {
            newDuties.push(createDutyAssignment(person.id, location, shift, dateStr));
          }
        }
        else if (shift === 'Akşam 1') {
          // Akşam 1: TWO people, priority order:
          // 1. Normal Er + Kıdemli Er
          // 2. Normal Er + Çavuş
          // 3. Normal Er + Normal Er
          // 4. Normal Er + Dede
          // 5. Kıdemli Er + Dede
          // 6. Any 2 eligible
          
          const normalErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Normal');
          const çavuşlar = eligible.filter(p => p.mainRole === 'Çavuş');
          const kıdemliErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Kıdemli');
          const dedeErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Dede');
          
          const selected: Personnel[] = [];
          
          // Option 1: Normal Er + Kıdemli Er
          if (normalErler.length >= 1 && kıdemliErler.length >= 1) {
            selected.push(normalErler[0], kıdemliErler[0]);
          }
          // Option 2: Normal Er + Çavuş
          else if (normalErler.length >= 1 && çavuşlar.length >= 1) {
            selected.push(normalErler[0], çavuşlar[0]);
          }
          // Option 3: Normal Er + Normal Er
          else if (normalErler.length >= 2) {
            selected.push(normalErler[0], normalErler[1]);
          }
          // Option 4: Normal Er + Dede
          else if (normalErler.length >= 1 && dedeErler.length >= 1) {
            selected.push(normalErler[0], dedeErler[0]);
          }
          // Option 5: Kıdemli Er + Dede
          else if (kıdemliErler.length >= 1 && dedeErler.length >= 1) {
            selected.push(kıdemliErler[0], dedeErler[0]);
          }
          // Option 6: Any 2 eligible
          else {
            const uygun = eligible.filter(p => !selected.includes(p)).slice(0, 2);
            selected.push(...uygun);
          }
          
          for (const person of selected) {
            newDuties.push(createDutyAssignment(person.id, location, shift, dateStr));
          }
        }
        else {
          // Gece 1 / Gece 2: TWO people, prioritize Normal Er
          const normalErler = eligible.filter(p => p.mainRole === 'Er' && p.seniority === 'Normal');
          const prioritized = [...normalErler, ...eligible.filter(p => !normalErler.includes(p))];
          const selected = prioritized.slice(0, count);
          
          for (const person of selected) {
            newDuties.push(createDutyAssignment(person.id, location, shift, dateStr));
          }
        }
      }
    }

    // Add all new duties to database
    for (const duty of newDuties) {
      dispatch({ type: 'ADD_DUTY', payload: duty });
      const { error } = await supabaseHelpers.addDuty({ ...duty, created_at: duty.createdAt.toISOString(), updated_at: duty.updatedAt.toISOString() });
      if (error) console.error('Auto-schedule add duty error:', error);
    }
  }

  // Helper function to create duty assignment
  function createDutyAssignment(personnelId: string, location: string, shift: ShiftType, dateStr: string): DutyAssignment {
    return {
      id: uuidv4(),
      personnelId,
      location: location as DutyLocation,
      shift,
      date: new Date(dateStr),
      isManual: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async function clearAutoSchedule(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    const autoDuties = state.duties.filter(d => new Date(d.date).toISOString().split('T')[0] === dateStr && !d.isManual);
    
    for (const duty of autoDuties) {
      dispatch({ type: 'DELETE_DUTY', payload: duty.id });
      const { error } = await supabaseHelpers.deleteDuty(duty.id);
      if (error) console.error('Auto-schedule delete duty error:', error);
    }
  }

  // Refresh all data from Supabase
  async function refreshData() {
    if (!supabase) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Reload personnel
      const { data: personnel, error: pError } = await supabaseHelpers.getPersonnel();
      if (!pError && personnel) {
        dispatch({ type: 'SET_PERSONNEL', payload: snakeToCamel(personnel) as any });
      }

      // Reload leaves
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const { data: leaves } = await supabaseHelpers.getLeaves(startOfMonth, endOfMonth);
      if (leaves) {
        dispatch({ type: 'SET_LEAVES', payload: snakeToCamel(leaves) as any });
      }

      // Reload duties for current date
      const today = now.toISOString().split('T')[0];
      const { data: duties } = await supabaseHelpers.getDuties(today);
      if (duties) {
        dispatch({ type: 'SET_DUTIES', payload: snakeToCamel(duties) as any });
      }

      // Reload exemptions
      const { data: exemptions } = await supabaseHelpers.getExemptions();
      if (exemptions) {
        dispatch({ type: 'SET_EXEMPTIONS', payload: snakeToCamel(exemptions) as any });
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
    addExemption,
    updateExemption,
    deleteExemption,
    runAutoSchedule,
    clearAutoSchedule,
    setCurrentDate,
    refreshData
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

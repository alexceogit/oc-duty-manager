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
  pendingDuties: DutyAssignment[]; // Generated but not yet saved
  exemptions: PersonnelExemption[];
  settings: AlgorithmSettings;
  currentDate: Date;
  isLoading: boolean;
  error: string | null;
  supabaseConnected: boolean;
  hasUnsavedChanges: boolean; // Track if there are pending changes
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
  | { type: 'SET_PENDING_DUTIES'; payload: DutyAssignment[] }
  | { type: 'CLEAR_PENDING_DUTIES' }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial state - Empty arrays, no mock data
const initialState: AppState = {
  personnel: [],
  leaves: [],
  duties: [],
  pendingDuties: [],
  exemptions: [],
  settings: defaultSettings,
  currentDate: new Date(),
  isLoading: false,
  error: null,
  supabaseConnected: false,
  hasUnsavedChanges: false
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
    case 'SET_PENDING_DUTIES':
      return { ...state, pendingDuties: action.payload, hasUnsavedChanges: true };
    case 'CLEAR_PENDING_DUTIES':
      return { ...state, pendingDuties: [], hasUnsavedChanges: false };
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload };
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
  runAutoSchedule: (date: Date) => Promise<DutyAssignment[]>;
  clearAutoSchedule: (date: Date) => void;
  savePendingDuties: () => Promise<void>;
  discardPendingDuties: () => void;
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
  
  // Use ref to track latest state for stale closure fixes
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const startOfMonth = startOfMonthDate.toISOString();
          const endOfMonth = endOfMonthDate.toISOString();
          const { data: leaves, error: lError } = await supabaseHelpers.getLeaves(startOfMonth, endOfMonth);
          if (lError) console.error('Leaves load error:', lError);
          if (leaves) {
            dispatch({ type: 'SET_LEAVES', payload: snakeToCamel(leaves) as any });
          }

          // Load duties for current month (for MonthlyCalendar)
          const startOfMonthStr = startOfMonthDate.toISOString().split('T')[0];
          const endOfMonthStr = endOfMonthDate.toISOString().split('T')[0];
          const { data: duties, error: dError } = await supabaseHelpers.getDutiesByMonth(startOfMonthStr, endOfMonthStr);
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
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        // No Supabase configured - start with empty state
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
    
    // Manual duties go to pendingDuties (need save confirmation)
    // Auto-generated duties also go to pendingDuties
    dispatch({ type: 'SET_PENDING_DUTIES', payload: [...state.pendingDuties, newDuty] });
  }

  async function updateDuty(id: string, updates: Partial<DutyAssignment>) {
    const updatedDuty = { ...updates, id, updatedAt: new Date() } as DutyAssignment;
    dispatch({ type: 'UPDATE_DUTY', payload: updatedDuty });
    const { error } = await supabaseHelpers.updateDuty(id, camelToSnake({ ...updates, updated_at: new Date().toISOString() }));
    if (error) console.error('Update duty error:', error);
  }

  async function deleteDuty(id: string) {
    // Check if duty exists in pendingDuties first (manual duties go to pending)
    const pendingDuty = state.pendingDuties.find(d => d.id === id);
    
    if (pendingDuty) {
      // Remove from pendingDuties
      dispatch({ type: 'SET_PENDING_DUTIES', payload: state.pendingDuties.filter(d => d.id !== id) });
    } else {
      // Remove from duties (saved duties)
      dispatch({ type: 'DELETE_DUTY', payload: id });
      const { error } = await supabaseHelpers.deleteDuty(id);
      if (error) console.error('Delete duty error:', error);
    }
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

  // Auto-schedule algorithm with GÜNDÜZ FILL rule (fill empty day shifts with night personnel)
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

    const newDuties: DutyAssignment[] = [];

    // Helper to get all currently assigned personnel IDs for this shift (any location)
    const getAssignedForShift = (shift: string): string[] => {
      return newDuties
        .filter(d => d.shift === shift && new Date(d.date).toISOString().split('T')[0] === dateStr)
        .map(d => d.personnelId);
    };

    // Sort shifts by time order: Akşam → Gece → Gündüz (starting from 18:00)
    const shiftOrder: ShiftType[] = ['Akşam 1', 'Gece 1', 'Gece 2', 'Gündüz 1', 'Gündüz 2'];

    // Process each shift SEQUENTIALLY
    for (const shift of shiftOrder) {
      // Get all already assigned personnel for this shift
      const alreadyAssigned = getAssignedForShift(shift);
      
      // Calculate personnel needed for each location in this shift
      const locationNeeds = locations.map(location => ({
        location,
        needed: getPersonnelCount(location, shift)
      }));
      
      // Get eligible personnel for this shift
      let eligible = sortedPersonnel.filter(p => {
        // Already assigned in this shift?
        if (alreadyAssigned.includes(p.id)) return false;
        
        // Max duties check
        const personDuties = newDuties.filter(d => d.personnelId === p.id);
        const maxDuties = p.seniority === 'Normal' ? 2 : 1;
        if (personDuties.length >= maxDuties) return false;
        
        // Subrole exclusion
        if (p.subRole && state.settings.excludeSubRoles.includes(p.subRole)) return false;
        
        // Dede night restriction
        if (p.seniority === 'Dede' && (shift === 'Gece 1' || shift === 'Gece 2')) return false;
        
        // Exemptions check
        const hasExemp = state.exemptions.some(e => 
          e.personnelId === p.id && e.isActive && 
          ((e.exemptionType === 'shift' && e.targetValue === shift) ||
           (e.exemptionType === 'location' && locationNeeds.some(ln => e.targetValue === ln.location)) ||
           (e.exemptionType === 'shift_location' && e.targetValue.includes(shift)))
        );
        if (hasExemp) return false;
        
        // 8-hour gap check
        const personDutiesToday = newDuties.filter(d => 
          d.personnelId === p.id && new Date(d.date).toISOString().split('T')[0] === dateStr
        );
        let hasGap = true;
        for (const duty of personDutiesToday) {
          if (!duty.shift) continue;
          const existingEnd = shiftTimes[duty.shift].end;
          const newStart = shiftTimes[shift].start;
          let gap: number;
          if (existingEnd > newStart) {
            gap = (24 - existingEnd) + newStart;
          } else {
            gap = newStart - existingEnd;
          }
          if (gap < 8) {
            hasGap = false;
            break;
          }
        }
        if (!hasGap) return false;
        
        return true;
      });

      // Sort eligible by seniority priority
      eligible = eligible.sort((a, b) => {
        const priority = state.settings.priorityOrder;
        return priority.indexOf(a.seniority) - priority.indexOf(b.seniority);
      });

      // Assign personnel to locations
      let personIndex = 0;
      
      for (const ln of locationNeeds) {
        const needed = ln.needed;
        const assignedForLocation: Personnel[] = [];
        let assignedCount = 0;
        
        for (let i = 0; i < needed && personIndex < eligible.length; i++) {
          // Find next eligible person who can work at this location
          while (personIndex < eligible.length) {
            const person = eligible[personIndex];
            
            // Check if this person has exemption for this location
            const hasExemp = state.exemptions.some(e => 
              e.personnelId === person.id && e.isActive && 
              ((e.exemptionType === 'location' && e.targetValue === ln.location) ||
               (e.exemptionType === 'shift_location' && e.targetValue === `${shift}|${ln.location}`))
            );
            
            // Check if person is already assigned to THIS location today
            const alreadyAtLocation = newDuties.some(d => 
              d.personnelId === person.id && 
              d.location === ln.location &&
              new Date(d.date).toISOString().split('T')[0] === dateStr
            );
            
            if (alreadyAtLocation) {
              personIndex++;
              continue;
            }
            
            // 8-hour gap check from ANY previous assignment (across ALL locations)
            let conflictFound = false;
            for (const duty of newDuties.filter(d => d.personnelId === person.id)) {
              if (!duty.shift) continue;
              const existingEnd = shiftTimes[duty.shift].end;
              const newStart = shiftTimes[shift].start;
              let gap: number;
              if (existingEnd > newStart) {
                gap = (24 - existingEnd) + newStart;
              } else {
                gap = newStart - existingEnd;
              }
              if (gap < 8) {
                conflictFound = true;
                break;
              }
            }
            
            if (conflictFound) {
              personIndex++;
              continue;
            }
            
            if (!hasExemp) {
              assignedForLocation.push(person);
              personIndex++;
              assignedCount++;
              break;
            }
            personIndex++;
          }
        }
        
        // Add assignments for this location
        for (const person of assignedForLocation) {
          newDuties.push(createDutyAssignment(person.id, ln.location, shift, dateStr));
        }
        
        // DEVRIYE FALLBACK: If still need personnel, assign Devriye
        if (assignedCount < needed) {
          const devriyePriority = ['Gece 2', 'Gece 1', 'Akşam 1'];
          const devriyeOrderIndex = devriyePriority.indexOf(shift);
          
          // Only assign Devriye for night/evening shifts (not Gündüz)
          if (devriyeOrderIndex >= 0) {
            const currentDevriyeCount = newDuties.filter(d => 
              d.isDevriye && d.location === ln.location && d.shift === shift
            ).length;
            
            if (currentDevriyeCount < (needed - assignedCount)) {
              newDuties.push({
                id: uuidv4(),
                personnelId: 'devriye-placeholder',
                location: ln.location,
                shift,
                date: new Date(dateStr),
                isManual: false,
                isDevriye: true,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
          }
        }
      }
    }

    // ========================================
    // GÜNDÜZ DOLDURMA KURALI - Fill empty day shifts
    // ========================================
    // If Gündüz 2 (12:00-18:00) is still empty for any location, 
    // pull personnel from night shifts (they become "boş geçmiş")
    const dayShifts: ShiftType[] = ['Gündüz 1', 'Gündüz 2'];
    
    for (const shift of dayShifts) {
      for (const location of locations) {
        const needed = getPersonnelCount(location, shift);
        const existingDuties = newDuties.filter(d => 
          d.location === location && 
          d.shift === shift &&
          new Date(d.date).toISOString().split('T')[0] === dateStr
        );
        
        let currentCount = existingDuties.length;
        
        if (currentCount < needed) {
          // Need to fill: Get all personnel who worked night shifts (Akşam 1, Gece 1, Gece 2)
          const nightShifts: ShiftType[] = ['Akşam 1', 'Gece 1', 'Gece 2'];
          
          for (const nightShift of nightShifts) {
            const nightDuties = newDuties.filter(d => 
              d.shift === nightShift &&
              new Date(d.date).toISOString().split('T')[0] === dateStr &&
              !d.isDevriye // Skip devriye placeholders
            );
            
            for (const duty of nightDuties) {
              if (currentCount >= needed) break;
              
              // Check if this person is already assigned to this day shift
              const alreadyAssigned = existingDuties.some(d => d.personnelId === duty.personnelId);
              if (alreadyAssigned) continue;
              
              // Check if person already has 2 duties
              const personTotalDuties = newDuties.filter(d => d.personnelId === duty.personnelId).length;
              const maxDuties = sortedPersonnel.find(p => p.id === duty.personnelId)?.seniority === 'Normal' ? 2 : 1;
              
              if (personTotalDuties >= maxDuties) continue;
              
              // Check exemption for this location
              const hasExemp = state.exemptions.some(e => 
                e.personnelId === duty.personnelId && e.isActive && 
                ((e.exemptionType === 'location' && e.targetValue === location) ||
                 (e.exemptionType === 'shift_location' && e.targetValue.includes(shift) && e.targetValue.includes(location)))
              );
              
              if (hasExemp) continue;
              
              // Assign this person to fill the gap
              newDuties.push(createDutyAssignment(duty.personnelId, location, shift, dateStr));
              existingDuties.push(newDuties[newDuties.length - 1]);
              currentCount++;
              
              if (currentCount >= needed) break;
            }
          }
        }
      }
    }

    // Return the generated duties (don't save yet - let user confirm)
    // This will be stored in a temporary state for review
    return newDuties;
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
    const currentDuties = stateRef.current.duties;
    
    // Get ALL duties for this date (both manual and auto)
    const allDutiesForDate = currentDuties.filter(d => 
      new Date(d.date).toISOString().split('T')[0] === dateStr
    );
    
    if (allDutiesForDate.length === 0) {
      return; // Nothing to clear
    }
    
    // Dispatch loading state
    dispatch({ type: 'SET_LOADING', payload: true });
    
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Delete each duty from Supabase
      for (const duty of allDutiesForDate) {
        const { error } = await supabaseHelpers.deleteDuty(duty.id);
        if (error) {
          errorCount++;
        } else {
          successCount++;
        }
      }
      
      // Clear all duties for this date from local state
      dispatch({ type: 'SET_DUTIES_FOR_DATE', payload: { date: dateStr, duties: [] } });
      // Also clear pending duties
      dispatch({ type: 'CLEAR_PENDING_DUTIES' });
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // Save pending duties to database
  async function savePendingDuties() {
    const pending = stateRef.current.pendingDuties;
    if (pending.length === 0) {
      alert('Hata: Kaydedilecek nöbet yok!');
      return;
    }
    
    alert(`DEBUG: ${pending.length} nöbet kaydedilecek...\n\n` + pending.map((d, i) => 
      `${i+1}. ${d.location} - ${d.shift || 'Nizamiye'} - Personel: ${d.personnelId?.substring(0,8)}...`
    ).join('\n'));
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      for (const duty of pending) {
        alert(`DEBUG: Kaydediliyor - ${duty.location} - ${duty.shift || 'Nizamiye'}`);
        
        // Save to Supabase
        const { error } = await supabaseHelpers.addDuty({
          personnel_id: duty.personnelId,
          location: duty.location,
          shift: duty.shift,
          date: new Date(duty.date).toISOString().split('T')[0],
          is_manual: duty.isManual,
          is_devriye: duty.isDevriye || false
        });
        
        if (error) {
          alert(`HATA: ${typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata'}`);
          console.error('Save pending duty error:', error);
        } else {
          alert(`OK: ${duty.location} - ${duty.shift || 'Nizamiye'} kaydedildi`);
        }
      }
      
      alert('DEBUG: Tüm nöbetler kaydedildi, pending temizleniyor...');
      
      // Clear pending duties
      dispatch({ type: 'CLEAR_PENDING_DUTIES' });
      
      // Reload all data from Supabase to ensure sync
      await refreshData();
      
      alert('DEBUG: İşlem tamamlandı! Sayfa yenilenecek.');
      
    } catch (err) {
      alert(`CRITICAL ERROR: ${JSON.stringify(err)}`);
      console.error('Error saving pending duties:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // Discard pending duties
  function discardPendingDuties() {
    dispatch({ type: 'CLEAR_PENDING_DUTIES' });
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
      const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startOfMonthISO = startOfMonthDate.toISOString();
      const endOfMonthISO = endOfMonthDate.toISOString();
      const { data: leaves } = await supabaseHelpers.getLeaves(startOfMonthISO, endOfMonthISO);
      if (leaves) {
        dispatch({ type: 'SET_LEAVES', payload: snakeToCamel(leaves) as any });
      }

      // Reload duties for current month
      const startOfMonthStr = startOfMonthDate.toISOString().split('T')[0];
      const endOfMonthStr = endOfMonthDate.toISOString().split('T')[0];
      const { data: duties } = await supabaseHelpers.getDutiesByMonth(startOfMonthStr, endOfMonthStr);
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
    savePendingDuties,
    discardPendingDuties,
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

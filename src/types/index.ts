// ============================================
// TYPES - Core data models for Duty Manager
// ============================================

// Personnel roles
export type MainRole = 'Çavuş' | 'Onbaşı' | 'Er';

export type SubRole = 
  | 'Haberci' 
  | 'Santral' 
  | 'Yazıcı' 
  | 'Nizamiye' 
  | 'Şoför' 
  | 'Rolsüz';

export type SeniorityLevel = 'Normal' | 'Kıdemli' | 'Dede';

// Leave types
export type LeaveType = 
  | 'Yıllık İzin' 
  | 'Hafta Sonu İzni' 
  | 'Hastalık İzni' 
  | 'Mükafat İzni' 
  | 'Mazeret İzni';

// Duty locations
export type DutyLocation = 
  | 'Çapraz' 
  | 'Kaya1' 
  | 'Kaya2' 
  | 'Nizamiye' 
  | '24cü'
  | 'Santral';

// Shift types for Çapraz, Kaya1, Kaya2
// Gündüz: 6 saat (2 vardiya), Akşam/Gece: 4 saat (3 vardiya)
export type ShiftType = 
  | 'Gündüz 1'   // 06:00 - 12:00 (6 saat)
  | 'Gündüz 2'   // 12:00 - 18:00 (6 saat)
  | 'Akşam 1'    // 18:00 - 22:00 (4 saat)
  | 'Gece 1'     // 22:00 - 02:00 (4 saat)
  | 'Gece 2'     // 02:00 - 06:00 (4 saat)
  | 'Santral Gündüz'  // 08:00 - 20:00 (12 saat)
  | 'Santral Gece';   // 20:00 - 08:00 (12 saat)

// Personnel interface
export interface Personnel {
  id: string;
  firstName: string;
  lastName: string;
  mainRole: MainRole;
  subRole: SubRole | null;
  seniority: SeniorityLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Leave interface
export interface Leave {
  id: string;
  personnelId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  startTime?: string;  // HH:mm format
  endTime?: string;    // HH:mm format
  isApproved: boolean;
  notes?: string;
  createdAt: Date;
}

// Duty assignment interface
export interface DutyAssignment {
  id: string;
  personnelId: string;
  location: DutyLocation;
  shift?: ShiftType;
  date: Date;
  isManual: boolean;
  isDevriye?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Duty configuration per location
export interface DutyConfig {
  location: DutyLocation;
  shifts: ShiftType[];
  personnelPerShift: number;
  isAutomatic: boolean;
  requiresMainRole?: MainRole[];
  requiresSubRole?: SubRole[];
}

// Algorithm settings
export interface AlgorithmSettings {
  allowMultipleDutiesPerDay: boolean;
  maxDutiesPerDayNormal: number;
  maxDutiesPerDaySenior: number;
  priorityOrder: SeniorityLevel[];
  excludeSubRoles: SubRole[];
  nightShiftPriority: SeniorityLevel[];
}

// Monthly schedule
export interface MonthlySchedule {
  year: number;
  month: number;
  assignments: DutyAssignment[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Exemption types
export type ExemptionType = 'shift' | 'location' | 'shift_location';

// Personnel exemption interface
export interface PersonnelExemption {
  id: string;
  personnelId: string;
  exemptionType: ExemptionType;
  targetValue: ShiftType | DutyLocation | string;  // string for "shift|location" format
  reason?: string;
  isActive: boolean;
  createdAt: Date;
}

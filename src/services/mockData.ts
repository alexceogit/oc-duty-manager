// ============================================
// MOCK DATA SERVICE
// For local testing without Supabase
// ============================================

import type { Personnel, Leave, DutyAssignment } from '../types';

// Mock Personnel Data
export const mockPersonnel: Personnel[] = [
  // Çavuşlar
  { id: 'p1', firstName: 'Ahmet', lastName: 'Yılmaz', mainRole: 'Çavuş', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p2', firstName: 'Mehmet', lastName: 'Kaya', mainRole: 'Çavuş', subRole: null, seniority: 'Kıdemli', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p3', firstName: 'Ali', lastName: 'Demir', mainRole: 'Çavuş', subRole: null, seniority: 'Dede', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Onbaşılar
  { id: 'p4', firstName: 'Hasan', lastName: 'Çelik', mainRole: 'Onbaşı', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p5', firstName: 'Hüseyin', lastName: 'Koç', mainRole: 'Onbaşı', subRole: null, seniority: 'Kıdemli', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p6', firstName: 'Mustafa', lastName: 'Öz', mainRole: 'Onbaşı', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Erler - Normal
  { id: 'p7', firstName: 'Ali', lastName: 'Veli', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p8', firstName: 'Ayşe', lastName: 'Kadın', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p9', firstName: 'Fatma', lastName: 'Hanım', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p10', firstName: 'Zeynep', lastName: 'Gül', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p11', firstName: 'Elif', lastName: 'Yıldız', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Erler - Kıdemli
  { id: 'p12', firstName: 'Osman', lastName: 'Koç', mainRole: 'Er', subRole: null, seniority: 'Kıdemli', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p13', firstName: 'Ramazan', lastName: 'Yıldırım', mainRole: 'Er', subRole: null, seniority: 'Kıdemli', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Erler - Dede
  { id: 'p14', firstName: 'İbrahim', lastName: 'Çiftçi', mainRole: 'Er', subRole: null, seniority: 'Dede', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p15', firstName: 'Süleyman', lastName: 'Aydın', mainRole: 'Er', subRole: null, seniority: 'Dede', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // Özel Roller (Manuel atama)
  { id: 'p16', firstName: 'Mahmut', lastName: 'Haberci', mainRole: 'Er', subRole: 'Haberci', seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p17', firstName: 'Selim', lastName: 'Santral', mainRole: 'Er', subRole: 'Santral', seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p18', firstName: 'Emre', lastName: 'Yazıcı', mainRole: 'Er', subRole: 'Yazıcı', seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p19', firstName: 'Burak', lastName: 'Nizamiye', mainRole: 'Er', subRole: 'Nizamiye', seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'p20', firstName: 'Tolga', lastName: 'Şoför', mainRole: 'Er', subRole: 'Şoför', seniority: 'Normal', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// Generate mock leaves for this week
export function generateMockLeaves(): Leave[] {
  const leaves: Leave[] = [];
  const today = new Date();
  const leaveTypes: Leave['leaveType'][] = ['Yıllık İzin', 'Hafta Sonu İzni', 'Hastalık İzni', 'Mükafat İzni', 'Mazeret İzni'];
  
  // Randomly assign leaves to some personnel (30%)
  mockPersonnel.forEach(person => {
    if (Math.random() > 0.7 && person.subRole === null) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + Math.floor(Math.random() * 5));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
      
      leaves.push({
        id: `leave-${person.id}`,
        personnelId: person.id,
        leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        startDate,
        endDate,
        startTime: undefined,
        endTime: undefined,
        isApproved: true,
        notes: undefined,
        createdAt: new Date()
      });
    }
  });
  
  return leaves;
}

// Generate mock duties for a week
export function generateMockDuties(): DutyAssignment[] {
  const duties: DutyAssignment[] = [];
  const today = new Date();
  const locations: DutyAssignment['location'][] = ['Çapraz', 'Kaya1', 'Kaya2'];
  const shifts: DutyAssignment['shift'][] = ['Sabah 1', 'Sabah 2', 'Öğlen', 'Akşam 1', 'Gece 1', 'Gece 2'];
  
  // Generate for 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Skip weekends for realism (optional)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Skip Sunday
    
    locations.forEach(location => {
      shifts.forEach(shift => {
        // Gece shifts have 2 people (except Çapraz)
        const numPersonnel = (shift === 'Gece 1' || shift === 'Gece 2') && location !== 'Çapraz' ? 2 : 1;
        
        // Get eligible personnel (exclude special roles)
        const eligible = mockPersonnel.filter(p => {
          if (!p.isActive) return false;
          if (p.subRole && ['Haberci', 'Santral'].includes(p.subRole)) return false;
          if (p.seniority === 'Dede' && (shift === 'Gece 1' || shift === 'Gece 2')) return false;
          return true;
        });
        
        for (let i = 0; i < numPersonnel && eligible.length > 0; i++) {
          // Random selection
          const randomIndex = Math.floor(Math.random() * eligible.length);
          const person = eligible.splice(randomIndex, 1)[0];
          
          duties.push({
            id: `duty-${person.id}-${date.toISOString().split('T')[0]}-${shift}`,
            personnelId: person.id,
            location,
            shift,
            date: new Date(date),
            isManual: Math.random() > 0.8,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    });
  }
  
  return duties;
}

// Initialize mock data
let mockLeaves = generateMockLeaves();
let mockDuties = generateMockDuties();

// Mock data service
export const mockDataService = {
  getPersonnel: () => mockPersonnel,
  
  getLeaves: () => mockLeaves,
  addLeave: (leave: Omit<Leave, 'id' | 'createdAt'>) => {
    const newLeave: Leave = {
      ...leave,
      id: `leave-${Date.now()}`,
      createdAt: new Date()
    };
    mockLeaves.push(newLeave);
    return newLeave;
  },
  
  getDuties: () => mockDuties,
  addDuty: (duty: Omit<DutyAssignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDuty: DutyAssignment = {
      ...duty,
      id: `duty-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDuties.push(newDuty);
    return newDuty;
  },
  
  deleteDuty: (id: string) => {
    mockDuties = mockDuties.filter(d => d.id !== id);
  },
  
  resetData: () => {
    mockLeaves = generateMockLeaves();
    mockDuties = generateMockDuties();
  }
};

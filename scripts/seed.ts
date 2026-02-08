// ============================================
// MOCK DATA SEED SCRIPT
// For testing Supabase integration
// Run: npm run seed
// ============================================

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Configuration - Replace with your values
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mock Personnel Data
const mockPersonnel = [
  // Çavuşlar
  { firstName: 'Ahmet', lastName: 'Yılmaz', mainRole: 'Çavuş', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Mehmet', lastName: 'Kaya', mainRole: 'Çavuş', subRole: null, seniority: 'Kıdemli', isActive: true },
  { firstName: 'Ali', lastName: 'Demir', mainRole: 'Çavuş', subRole: null, seniority: 'Dede', isActive: true },
  
  // Onbaşılar
  { firstName: 'Hasan', lastName: 'Çelik', mainRole: 'Onbaşı', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Hüseyin', lastName: 'Koç', mainRole: 'Onbaşı', subRole: null, seniority: 'Kıdemli', isActive: true },
  { firstName: 'Mustafa', lastName: 'Öz', mainRole: 'Onbaşı', subRole: null, seniority: 'Normal', isActive: true },
  
  // Erler - Normal
  { firstName: 'Ali', lastName: 'Veli', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Ayşe', lastName: 'Kadın', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Fatma', lastName: 'Hanım', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Zeynep', lastName: 'Gül', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true },
  { firstName: 'Elif', lastName: 'Yıldız', mainRole: 'Er', subRole: null, seniority: 'Normal', isActive: true },
  
  // Erler - Kıdemli
  { firstName: 'Osman', lastName: 'Koç', mainRole: 'Er', subRole: null, seniority: 'Kıdemli', isActive: true },
  { firstName: 'Ramazan', lastName: 'Yıldırım', mainRole: 'Er', subRole: null, seniority: 'Kıdemli', isActive: true },
  
  // Erler - Dede
  { firstName: 'İbrahim', lastName: 'Çiftçi', mainRole: 'Er', subRole: null, seniority: 'Dede', isActive: true },
  { firstName: 'Süleyman', lastName: 'Aydın', mainRole: 'Er', subRole: null, seniority: 'Dede', isActive: true },
  
  // Özel Roller (Manuel atama - Otomatik'e dahil değil)
  { firstName: 'Mahmut', lastName: 'Haberci', mainRole: 'Er', subRole: 'Haberci', seniority: 'Normal', isActive: true },
  { firstName: 'Selim', lastName: 'Santral', mainRole: 'Er', subRole: 'Santral', seniority: 'Normal', isActive: true },
  { firstName: 'Emre', lastName: 'Yazıcı', mainRole: 'Er', subRole: 'Yazıcı', seniority: 'Normal', isActive: true },
  { firstName: 'Burak', lastName: 'Nizamiye', mainRole: 'Er', subRole: 'Nizamiye', seniority: 'Normal', isActive: true },
  { firstName: 'Tolga', lastName: 'Şoför', mainRole: 'Er', subRole: 'Şoför', seniority: 'Normal', isActive: true },
];

// Generate mock leaves for this week
function generateMockLeaves(personnelIds: string[]) {
  const leaves = [];
  const today = new Date();
  const leaveTypes = ['Yıllık İzin', 'Hafta Sonu İzni', 'Hastalık İzni', 'Mükafat İzni', 'Mazeret İzni'];
  
  // Randomly assign leaves to some personnel
  personnelIds.forEach((id, index) => {
    if (Math.random() > 0.7) { // 30% chance of leave
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + Math.floor(Math.random() * 5));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1);
      
      leaves.push({
        personnel_id: id,
        leave_type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        start_time: null,
        end_time: null,
        is_approved: true,
        notes: null,
        created_at: new Date().toISOString()
      });
    }
  });
  
  return leaves;
}

// Generate mock duties for a week
function generateMockDuties(personnelIds: string[]) {
  const duties = [];
  const today = new Date();
  const locations = ['Çapraz', 'Kaya1', 'Kaya2'];
  const shifts = [
    { name: 'Sabah 1', time: '06:00:00' },
    { name: 'Sabah 2', time: '10:00:00' },
    { name: 'Öğlen', time: '14:00:00' },
    { name: 'Akşam 1', time: '18:00:00' },
    { name: 'Gece 1', time: '22:00:00' },
    { name: 'Gece 2', time: '02:00:00' },
  ];
  
  // Generate for 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    locations.forEach(location => {
      shifts.forEach(shift => {
        // Assign 1-2 people per shift
        const numPersonnel = (shift.name.includes('Gece') && location !== 'Çapraz') ? 2 : 1;
        
        for (let i = 0; i < numPersonnel; i++) {
          // Random personnel (skip special roles)
          const eligiblePersonnel = personnelIds.filter((_, idx) => {
            const person = mockPersonnel[idx];
            return person.subRole === null || !['Haberci', 'Santral'].includes(person.subRole);
          });
          
          if (eligiblePersonnel.length > 0) {
            const randomPersonnel = eligiblePersonnel[Math.floor(Math.random() * eligiblePersonnel.length)];
            duties.push({
              personnel_id: randomPersonnel,
              location,
              shift: shift.time,
              date: dateStr,
              is_manual: Math.random() > 0.8, // 20% manual
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      });
    });
  }
  
  return duties;
}

async function seedDatabase() {
  console.log('🚀 Starting database seed...\n');
  
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await supabase.from('duty_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leaves').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('personnel').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Cleared existing data\n');
    
    // Insert personnel
    console.log('👥 Inserting personnel...');
    const personnelData = mockPersonnel.map(p => ({
      ...p,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedPersonnel, error: personnelError } = await supabase
      .from('personnel')
      .insert(personnelData)
      .select();
    
    if (personnelError) {
      throw new Error(`Error inserting personnel: ${personnelError.message}`);
    }
    
    console.log(`✅ Inserted ${insertedPersonnel.length} personnel\n`);
    
    // Generate and insert leaves
    console.log('🏖️  Generating mock leaves...');
    const personnelIds = insertedPersonnel.map(p => p.id);
    const mockLeaves = generateMockLeaves(personnelIds);
    
    if (mockLeaves.length > 0) {
      const { error: leaveError } = await supabase.from('leaves').insert(mockLeaves);
      if (leaveError) {
        throw new Error(`Error inserting leaves: ${leaveError.message}`);
      }
      console.log(`✅ Inserted ${mockLeaves.length} leaves\n`);
    }
    
    // Generate and insert duties
    console.log('📅 Generating mock duties...');
    const mockDuties = generateMockDuties(personnelIds);
    
    if (mockDuties.length > 0) {
      const { error: dutyError } = await supabase.from('duty_assignments').insert(mockDuties);
      if (dutyError) {
        throw new Error(`Error inserting duties: ${dutyError.message}`);
      }
      console.log(`✅ Inserted ${mockDuties.length} duties\n`);
    }
    
    console.log('🎉 Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Personnel: ${insertedPersonnel.length}`);
    console.log(`   - Leaves: ${mockLeaves.length}`);
    console.log(`   - Duties: ${mockDuties.length}`);
    console.log('\n💡 You can now test the application with mock data!');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    console.log('\n💡 Make sure you have set the following environment variables:');
    console.log('   VITE_SUPABASE_URL');
    console.log('   VITE_SUPABASE_KEY');
    process.exit(1);
  }
}

// Run if called directly
seedDatabase();

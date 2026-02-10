-- ============================================
-- SUPABASE SCHEMA - Clean Setup
-- ============================================

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PERSONNEL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personnel (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  main_role TEXT NOT NULL CHECK (main_role IN ('Çavuş', 'Onbaşı', 'Er')),
  sub_role TEXT CHECK (sub_role IN ('Haberci', 'Santral', 'Yazıcı', 'Nizamiye', 'Şoför', 'Rolsüz')),
  seniority TEXT NOT NULL CHECK (seniority IN ('Normal', 'Kıdemli', 'Dede')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEAVES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leaves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('Yıllık İzin', 'Hafta Sonu İzni', 'Hastalık İzni', 'Mükafat İzni', 'Mazeret İzni')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_approved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DUTY ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS duty_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('Çapraz', 'Kaya1', 'Kaya2', 'Nizamiye', 'Santral', '24cü')),
  shift TEXT CHECK (shift IN ('Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2', 'Santral Gündüz', 'Santral Gece')),
  date DATE NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PERSONNEL EXEMPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS personnel_exemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE NOT NULL,
  exemption_type TEXT NOT NULL CHECK (exemption_type IN ('shift', 'location', 'shift_location')),
  target_value TEXT NOT NULL,  -- For shift_location: "shift|location" format
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_personnel_is_active ON personnel(is_active);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_duties_date ON duty_assignments(date);
CREATE INDEX IF NOT EXISTS idx_exemptions_personnel ON personnel_exemptions(personnel_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Personnel: Authenticated users can read
CREATE POLICY "Auth users can read personnel" ON personnel
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Auth users can insert personnel" ON personnel
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can update personnel" ON personnel
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can delete personnel" ON personnel
  FOR DELETE TO authenticated USING (true);

-- Leaves: Authenticated users can read approved leaves
CREATE POLICY "Auth users can read leaves" ON leaves
  FOR SELECT TO authenticated USING (is_approved = true);

CREATE POLICY "Auth users can insert leaves" ON leaves
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can update leaves" ON leaves
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can delete leaves" ON leaves
  FOR DELETE TO authenticated USING (true);

-- Duty Assignments: Authenticated users can read/write
CREATE POLICY "Auth users can read duties" ON duty_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can insert duties" ON duty_assignments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users can update duties" ON duty_assignments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can delete duties" ON duty_assignments
  FOR DELETE TO authenticated USING (true);

-- Personnel Exemptions: Authenticated users can read/write
CREATE POLICY "Auth users can read exemptions" ON personnel_exemptions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can manage exemptions" ON personnel_exemptions
  FOR ALL TO authenticated USING (true);

SELECT 'Schema setup complete!' as status;

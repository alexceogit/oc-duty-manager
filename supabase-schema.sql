-- ============================================
-- SUPABASE SCHEMA - With Auth Tables
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager')),
  is', 'user_active BOOLEAN DEFAULT true,
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
  location TEXT NOT NULL CHECK (location IN ('Çapraz', 'Kaya1', 'Kaya2', 'Nizamiye', 'Santral')),
  shift TEXT CHECK (shift IN ('Gündüz 1', 'Gündüz 2', 'Akşam 1', 'Gece 1', 'Gece 2')),
  date DATE NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_personnel_is_active ON personnel(is_active);
CREATE INDEX IF NOT EXISTS idx_personnel_last_name ON personnel(last_name);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leaves_personnel ON leaves(personnel_id);
CREATE INDEX IF NOT EXISTS idx_duties_date ON duty_assignments(date);
CREATE INDEX IF NOT EXISTS idx_duties_personnel ON duty_assignments(personnel_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- PERSONNEL RLS POLICIES
-- ============================================

-- Authenticated users can view personnel
CREATE POLICY "Authenticated users can read personnel" ON personnel
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can modify personnel
CREATE POLICY "Admins can modify personnel" ON personnel
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- LEAVES RLS POLICIES
-- ============================================

-- Authenticated users can view approved leaves
CREATE POLICY "Authenticated users can read leaves" ON leaves
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

-- Only admins can modify leaves
CREATE POLICY "Admins can modify leaves" ON leaves
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================
-- DUTY ASSIGNMENTS RLS POLICIES
-- ============================================

-- Authenticated users can view duty assignments
CREATE POLICY "Authenticated users can read duties" ON duty_assignments
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify duty assignments
CREATE POLICY "Admins can modify duties" ON duty_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample personnel (disable RLS first in Supabase dashboard for this)
-- INSERT INTO personnel (first_name, last_name, main_role, sub_role, seniority) VALUES
--   ('Ahmet', 'Yılmaz', 'Çavuş', NULL, 'Normal'),
--   ('Mehmet', 'Kaya', 'Onbaşı', NULL, 'Kıdemli'),
--   ('Ali', 'Demir', 'Er', NULL, 'Normal'),
--   ('Hasan', 'Çelik', 'Er', 'Haberci', 'Normal'),
--   ('Hüseyin', 'Koç', 'Er', 'Santral', 'Normal');

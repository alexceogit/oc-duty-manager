-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Nöbet Yönetim Sistemi
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personnel Table
CREATE TABLE IF NOT EXISTS personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  main_role TEXT NOT NULL CHECK (main_role IN ('Çavuş', 'Onbaşı', 'Er')),
  sub_role TEXT CHECK (sub_role IN ('Haberci', 'Santral', 'Yazıcı', 'Nizamiye', 'Şoför', 'Rolsüz')),
  seniority TEXT NOT NULL CHECK (seniority IN ('Normal', 'Kıdemli', 'Dede')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('Yıllık İzin', 'Hafta Sonu İzni', 'Hastalık İzni', 'Mükafat İzni', 'Mazeret İzni')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_approved BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Duty Assignments Table
CREATE TABLE IF NOT EXISTS duty_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  location TEXT NOT NULL CHECK (location IN ('Çapraz', 'Kaya1', 'Kaya2', 'Nizamiye', 'Santral')),
  shift TIME,
  date DATE NOT NULL,
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_assignments ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow authenticated users for demo)
-- For production, you should configure more restrictive policies

CREATE POLICY "Allow public read access" ON personnel
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON personnel
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON personnel
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON leaves
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON leaves
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON leaves
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON leaves
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON duty_assignments
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON duty_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON duty_assignments
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON duty_assignments
  FOR DELETE USING (true);

-- Create Indexes for Performance
CREATE INDEX idx_leaves_personnel_id ON leaves(personnel_id);
CREATE INDEX idx_leaves_date_range ON leaves(start_date, end_date);
CREATE INDEX idx_duties_personnel_id ON duty_assignments(personnel_id);
CREATE INDEX idx_duties_date ON duty_assignments(date);
CREATE INDEX idx_personnel_active ON personnel(is_active);
CREATE INDEX idx_personnel_role ON personnel(main_role);
CREATE INDEX idx_personnel_seniority ON personnel(seniority);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_personnel_updated_at
  BEFORE UPDATE ON personnel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duty_assignments_updated_at
  BEFORE UPDATE ON duty_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN KULLANICI OLUŞTURMA
-- Email: admin@nobet.com
-- Şifre: 1@ss2d
-- ============================================

-- 1. Admin kullanıcıyı oluştur
INSERT INTO auth.users (
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.instances LIMIT 1),
  'admin@nobet.com',
  crypt('1@ss2d', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin"}',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('1@ss2d', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- 2. Profil tablosuna ekle (admin rolü)
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin',
  'admin'
FROM auth.users 
WHERE email = 'admin@nobet.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- 3. Kontrol et
SELECT email, role, created_at FROM profiles WHERE email = 'admin@nobet.com';

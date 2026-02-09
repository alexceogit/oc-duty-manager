-- ============================================
-- ADMIN KULLANICI OLUŞTURMA
-- Email: admin@nobet.com | Şifre: 1@ss2d
-- ============================================

-- Önce trigger'ı devre dışı bırak
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1. Mevcut kullanıcı varsa sil
DELETE FROM profiles WHERE email = 'admin@nobet.com';
DELETE FROM auth.users WHERE email = 'admin@nobet.com';

-- 2. UUID extension kontrolü
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Admin kullanıcıyı oluştur
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'admin@nobet.com',
  crypt('1@ss2d', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin"}',
  NOW(),
  NOW()
);

-- 4. Profil tablosuna admin rolü ile ekle
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin',
  'admin'
FROM auth.users 
WHERE email = 'admin@nobet.com';

-- 5. Trigger'ı geri aç (isteğe bağlı)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Kontrol
SELECT email, role FROM profiles WHERE email = 'admin@nobet.com';

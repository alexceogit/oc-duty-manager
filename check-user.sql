-- ============================================
-- KULLANICI KONTROLÜ
-- ============================================

-- 1. Kullanıcı var mı kontrol et
SELECT email, created_at FROM auth.users WHERE email = 'admin@nobet.com';

-- 2. Profil var mı kontrol et  
SELECT email, role FROM profiles WHERE email = 'admin@nobet.com';

-- 3. Tüm auth kullanıcılarını listele (email'leri)
SELECT email, email_confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

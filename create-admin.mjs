import { createClient } from '@supabase/supabase-js';

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreXV2cnlvcWVjdnh1c3RucHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU3MzM5NSwiZXhwIjoyMDg2MTQ5Mzk1fQ.BDFM5hJJIt3ErNTnzGcWuxm-Bv0bWE6Ff5077VQ8cYs';
const supabaseUrl = 'https://tkyuvryoqecvxustnpwg.supabase.co';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  console.log('1. Trigger\'ı siliyorum...');
  
  // Drop trigger via RPC
  const { error: triggerError } = await supabase.rpc('drop_trigger', { 
    trigger_name: 'on_auth_user_created',
    table_name: 'auth.users'
  });
  
  if (triggerError) {
    console.log('Trigger zaten yok veya hata:', triggerError.message);
  } else {
    console.log('✅ Trigger silindi');
  }

  console.log('2. Admin kullanıcısı oluşturuyorum...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@nobet.com',
    password: 'admin123',
    email_confirmed: true,
    user_metadata: { full_name: 'Admin' },
    app_metadata: { role: 'admin' }
  });

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin kullanıcısı oluşturuldu!');
  console.log('ID:', data.user.id);
  console.log('Email:', data.user.email);
}

createAdminUser();

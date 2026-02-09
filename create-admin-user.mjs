// ============================================
// CREATE ADMIN USER via Supabase Admin API
// ============================================

import { createClient } from '@supabase/supabase-js';

// Service role key (from Supabase Dashboard → Settings → API)
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRreXV2cnlvcWVjdnh1c3RucHdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODk4OTk5MCwiZXhwIjoyMDU0NTY1OTkwfQ.JmA2G5L7p2jf8P6g8xk9Y6V8Z6K4N6T5W9K8X7Y1Z0';
const supabaseUrl = 'https://tkyuvryoqecvxustnpwg.supabase.co';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  console.log('Creating admin user...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@nobet.com',
    password: 'admin123',
    email_confirmed: true,
    user_metadata: {
      full_name: 'Admin'
    },
    app_metadata: {
      role: 'admin'
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);
}

createAdminUser();

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('List Users Error:', error);
  } else {
    const user = data.users.find(u => u.email === 'mosesmwai100@gmail.com');
    console.log('User:', user);
  }
}

listUsers();

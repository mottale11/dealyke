import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSignIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test_new_user123@gmail.com',
    password: 'password123'
  });
  console.log('SignIn Error:', error);
}

testSignIn();

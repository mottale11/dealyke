import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSignUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test_new_user_xyz123@gmail.com',
    password: 'password123'
  });
  console.log('SignUp Data:', data);
  console.log('SignUp Error:', error);
}

testSignUp();

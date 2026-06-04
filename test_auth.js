import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mosesmwai100@gmail.com',
    password: 'password123'
  });
  console.log('Error:', error);
}

testAuth();

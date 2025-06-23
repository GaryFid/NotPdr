// Для работы с Supabase установи пакет: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'; // <-- ВСТАВЬ_СЮДА
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'; // <-- ВСТАВЬ_СЮДА

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
// Для работы с Supabase установи пакет: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Mock Supabase client для сборки без переменных окружения
class MockSupabaseClient {
  from(table: string) {
    return {
      select: () => ({ 
        eq: () => ({ 
          limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) 
        }),
        limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }),
      insert: () => ({ 
        select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) 
      }),
      update: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) 
      }),
      delete: () => ({ 
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) 
      })
    };
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  supabaseUrl.startsWith('https://'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient() as any; 
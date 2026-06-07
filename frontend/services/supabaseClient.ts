import { createClient } from '@supabase/supabase-js';

/**
 * يتم جلب هذه القيم من متغيرات البيئة.
 * في بيئة Vite، نستخدم import.meta.env.VITE_...
 * في بيئة Node.js (Backend)، نستخدم process.env....
 */
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 
                    (window as any)._env_?.SUPABASE_URL;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 
                        (window as any)._env_?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase Connection Error: URL or Anon Key is missing from environment variables.");
  throw new Error(
    "Supabase configuration missing! Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

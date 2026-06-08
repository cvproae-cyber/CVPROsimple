import { createClient } from '@supabase/supabase-js';

// يتم جلب هذه القيم من إعدادات مشروع Supabase الخاص بك
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
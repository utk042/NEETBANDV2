import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in frontend env');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const getAuthRedirectUrl = () => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 
                  import.meta.env.VITE_REDIRECT_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${siteUrl}/auth/callback`;
};


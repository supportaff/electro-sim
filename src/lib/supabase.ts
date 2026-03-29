import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CircuitProject = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  circuit_json: object;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  version: number;
};

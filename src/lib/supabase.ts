import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  plan: 'free' | 'pro';
  upload_count: number;
  created_at: string;
};

export type Upload = {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: 'pdf' | 'image';
  storage_path: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  created_at: string;
};

export type Analysis = {
  id: string;
  upload_id: string;
  user_id: string;
  topics: Topic[];
  recommendations: Recommendation[];
  predicted_areas: PredictedArea[];
  raw_text: string;
  question_count: number;
  created_at: string;
};

export type Topic = {
  name: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
};

export type Recommendation = {
  text: string;
  importance: 'critical' | 'important' | 'optional';
};

export type PredictedArea = {
  area: string;
  confidence: number;
};

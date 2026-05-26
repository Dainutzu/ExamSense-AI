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

// ─── Enriched Analysis Types ───────────────────────────────────────────────

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

export type TopicMapping = {
  question: string;
  core_topic: string;
  related_fields: string[];
  explanation: string;
  exam_notes: string;
};

export type KeyTheory = {
  name: string;
  subject: string;
  description: string;
};

export type StudyPlanItem = {
  day: string;
  focus: string;
  tasks: string[];
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
  // Enriched fields
  detected_subjects: string[];
  topic_mapping: TopicMapping[];
  key_theories: KeyTheory[];
  high_priority_topics: string[];
  predicted_questions: string[];
  study_plan: StudyPlanItem[];
  created_at: string;
};

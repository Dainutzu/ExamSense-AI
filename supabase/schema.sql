-- ExamSense AI — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ──────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  plan        TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro'
  upload_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Uploads ───────────────────────────────────────────────────────────────
CREATE TABLE uploads (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  file_size    BIGINT NOT NULL,
  file_type    TEXT NOT NULL,   -- 'pdf' | 'image'
  storage_path TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'processing' | 'done' | 'error'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own uploads"   ON uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON uploads FOR DELETE USING (auth.uid() = user_id);

-- ─── Analyses ──────────────────────────────────────────────────────────────
CREATE TABLE analyses (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id             UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topics                JSONB,    -- [{ name, count, priority }]
  recommendations       JSONB,    -- [{ text, importance }]
  predicted_areas       JSONB,    -- [{ area, confidence }]
  raw_text              TEXT,
  question_count        INT DEFAULT 0,
  -- Enriched fields
  detected_subjects     JSONB,    -- TEXT[] as JSON
  topic_mapping         JSONB,    -- [{ question, core_topic, related_fields, explanation, exam_notes }]
  key_theories          JSONB,    -- [{ name, subject, description }]
  high_priority_topics  JSONB,    -- TEXT[] as JSON
  predicted_questions   JSONB,    -- TEXT[] as JSON
  study_plan            JSONB,    -- [{ day, focus, tasks }]
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses"   ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Storage Bucket ────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Name: exam-papers
-- Public: false
-- File size limit: 10MB
-- Allowed types: application/pdf, image/jpeg, image/png, image/webp

-- Storage RLS (after creating bucket):
-- CREATE POLICY "Users can upload own files" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can read own files"   ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

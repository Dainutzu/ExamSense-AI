-- ─── FIX: "Database error saving user" on signup ──────────────────────────
-- Run this in Supabase SQL Editor to fix the signup trigger error.

-- 1. Drop and recreate the trigger function with proper search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Drop and recreate the trigger (in case it needs refreshing)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Add INSERT policy so the trigger can write to profiles
-- (SECURITY DEFINER bypasses RLS but this is a safety net)
DROP POLICY IF EXISTS "Service can insert profiles" ON profiles;
CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ─── Done ──────────────────────────────────────────────────────────────────
-- After running this, try signing up again. It should work.

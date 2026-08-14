-- Add INSERT policy for profiles table so users can insert their own profile
-- (the handle_new_user trigger already handles this via SECURITY DEFINER,
-- but this ensures the table is not locked if the trigger fails or is disabled)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

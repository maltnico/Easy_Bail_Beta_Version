/*
  # Fix infinite recursion in profiles table RLS policies

  1. Security Updates
    - Drop existing policies for profiles table that cause infinite recursion
    - Recreate policies with correct column references (id instead of user_id)
    - Ensure policies properly reference auth.uid() = id

  2. Changes
    - Fix SELECT policy to use id column instead of user_id
    - Fix UPDATE policy to use id column instead of user_id
    - Fix INSERT policy to use id column instead of user_id
    - Fix DELETE policy to use id column instead of user_id
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Recreate policies with correct column references
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

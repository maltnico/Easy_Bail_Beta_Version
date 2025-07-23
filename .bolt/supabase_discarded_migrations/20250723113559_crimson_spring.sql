/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current RLS policies on profiles table are causing infinite recursion
    - Policies are trying to query the profiles table from within the policy itself
    - This creates a circular dependency that PostgreSQL detects and blocks

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies that only use auth.uid()
    - Ensure admin access is handled without recursive queries

  3. Security
    - Users can only access their own profile data
    - Simple and secure policy structure
    - No circular dependencies
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;

-- Create simple, non-recursive policies
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

-- For admin functionality, we'll handle this at the application level
-- by using service role key when needed, rather than complex RLS policies
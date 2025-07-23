/*
  # Fix infinite recursion in profiles RLS policies - Final Solution

  1. Problem
    - RLS policies on profiles table are querying the same table, causing infinite recursion
    - This prevents user authentication and profile loading

  2. Solution
    - Drop ALL existing policies that cause recursion
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries to profiles table

  3. Security
    - Users can only access their own profile data
    - No admin policies to avoid recursion issues
    - Clean, simple access control
*/

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Drop the functions that might cause issues
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS get_user_role();

-- Create simple, non-recursive policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow profile creation during user registration
CREATE POLICY "Allow profile creation" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
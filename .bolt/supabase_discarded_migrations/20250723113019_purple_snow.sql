/*
  # Fix infinite recursion in profiles RLS policies

  1. New Functions
    - `is_admin()` - Security definer function to check admin role without RLS
    - `get_user_role()` - Security definer function to get user role without RLS

  2. Updated Policies
    - Replace recursive profile queries with security definer functions
    - Maintain same access control logic without recursion

  3. Security
    - Functions use SECURITY DEFINER to bypass RLS when needed
    - Policies remain restrictive for data access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Create new RLS policies for profiles without recursion
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (is_admin());

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" 
  ON profiles FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can insert profiles" 
  ON profiles FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete profiles" 
  ON profiles FOR DELETE 
  USING (is_admin());

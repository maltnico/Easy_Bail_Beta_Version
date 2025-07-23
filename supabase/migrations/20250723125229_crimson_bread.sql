/*
  # Fix Row Level Security for properties table

  1. Security Updates
    - Drop existing policies for properties table
    - Recreate policies with proper auth.uid() references
    - Ensure INSERT policy allows authenticated users to create properties with their user_id

  2. Changes
    - Fix INSERT policy to properly check user_id matches auth.uid()
    - Ensure all policies use consistent auth.uid() function calls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

-- Recreate policies with proper auth.uid() references
CREATE POLICY "Users can view own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
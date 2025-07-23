/*
  # Fix Properties RLS SELECT Policy

  This migration fixes the Row Level Security (RLS) SELECT policy for the properties table.
  The current policy is preventing authenticated users from reading properties data.

  ## Changes Made
  1. Drop the existing problematic SELECT policy
  2. Create a new SELECT policy that properly allows authenticated users to view their own properties
  3. Ensure the policy uses auth.uid() instead of uid() for proper authentication

  ## Security
  - Users can only view properties where they are the owner (user_id matches auth.uid())
  - Only authenticated users can access the data
*/

-- Drop the existing SELECT policy that's causing issues
DROP POLICY IF EXISTS "Users can view own properties" ON properties;

-- Recreate the SELECT policy with proper auth.uid() function
CREATE POLICY "Users can view own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify RLS is still enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

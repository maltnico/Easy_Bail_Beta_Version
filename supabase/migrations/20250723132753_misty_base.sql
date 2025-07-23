/*
  # Fix postal_code NOT NULL constraint

  1. Changes
    - Make postal_code column nullable in properties table
    - This allows properties to be created without requiring a postal code

  2. Security
    - No changes to existing RLS policies
*/

-- Make postal_code column nullable
ALTER TABLE properties ALTER COLUMN postal_code DROP NOT NULL;

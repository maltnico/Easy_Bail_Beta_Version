/*
  # Add amenities column to properties table

  1. Changes
    - Add `amenities` column to `properties` table
    - Column type: text[] (array of text)
    - Default value: empty array
    - Allow null values for backward compatibility

  2. Purpose
    - Store property amenities/equipment as an array of strings
    - Support the PropertyForm component that expects this column
*/

-- Add amenities column to properties table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE properties ADD COLUMN amenities text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Update existing records to have empty amenities array if null
UPDATE properties SET amenities = ARRAY[]::text[] WHERE amenities IS NULL;

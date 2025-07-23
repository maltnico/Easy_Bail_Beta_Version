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

-- Add amenities column to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE properties ADD COLUMN amenities text[] DEFAULT '{}';
  END IF;
END $$;
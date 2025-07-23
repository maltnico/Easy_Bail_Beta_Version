/*
  # Add amenities column to properties table - Final fix

  1. Changes
    - Add `amenities` column to `properties` table if it doesn't exist
    - Column type: text[] (array of text)
    - Default value: empty array
    - Update existing records to have empty array instead of null

  2. Security
    - No changes to existing RLS policies
*/

-- Add amenities column to properties table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'amenities'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN amenities text[] DEFAULT ARRAY[]::text[];
    
    -- Update existing records to have empty array instead of null
    UPDATE public.properties SET amenities = ARRAY[]::text[] WHERE amenities IS NULL;
    
    -- Add comment for documentation
    COMMENT ON COLUMN public.properties.amenities IS 'Property amenities and equipment as array of strings';
  END IF;
END $$;
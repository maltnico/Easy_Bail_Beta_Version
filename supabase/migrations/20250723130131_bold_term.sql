/*
  # Add category column to email_templates table

  1. New Column
    - Add 'category' column to email_templates table
    - Set default value to 'other'
    - Add check constraint for valid categories

  2. Security
    - No changes to existing RLS policies
*/

-- Add category column to email_templates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_templates' AND column_name = 'category'
  ) THEN
    ALTER TABLE email_templates 
    ADD COLUMN category text DEFAULT 'other'::text NOT NULL;
    
    -- Add check constraint for category values
    ALTER TABLE email_templates 
    ADD CONSTRAINT email_templates_category_check 
    CHECK (category = ANY (ARRAY['tenant'::text, 'property'::text, 'financial'::text, 'administrative'::text, 'other'::text]));
  END IF;
END $$;

-- Fix courses table to match the expected schema
-- This script will add the missing 'subject' column if it doesn't exist

-- Check if subject column exists, if not add it
DO $$ 
BEGIN
    -- Check if the subject column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'subject'
    ) THEN
        -- Add the subject column
        ALTER TABLE courses ADD COLUMN subject TEXT;
        RAISE NOTICE 'Added subject column to courses table';
    ELSE
        RAISE NOTICE 'Subject column already exists in courses table';
    END IF;
END $$;

-- Also ensure other columns exist
DO $$ 
BEGIN
    -- Check and add grade_level if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'grade_level'
    ) THEN
        ALTER TABLE courses ADD COLUMN grade_level INTEGER;
        RAISE NOTICE 'Added grade_level column to courses table';
    END IF;
    
    -- Check and add price if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'price'
    ) THEN
        ALTER TABLE courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added price column to courses table';
    END IF;
    
    -- Check and add max_students if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'max_students'
    ) THEN
        ALTER TABLE courses ADD COLUMN max_students INTEGER DEFAULT 20;
        RAISE NOTICE 'Added max_students column to courses table';
    END IF;
    
    -- Check and add duration_weeks if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'duration_weeks'
    ) THEN
        ALTER TABLE courses ADD COLUMN duration_weeks INTEGER DEFAULT 12;
        RAISE NOTICE 'Added duration_weeks column to courses table';
    END IF;
    
    -- Check and add is_active if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE courses ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column to courses table';
    END IF;
END $$;

-- Show the current structure of the courses table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

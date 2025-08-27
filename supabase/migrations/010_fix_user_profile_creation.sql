-- Migration to fix user profile creation and ensure all required fields exist
-- This migration ensures that user profiles are created properly when users sign up

-- ============================================================================
-- UPDATE USER PROFILE CREATION TRIGGER
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS ON_AUTH_USER_CREATED ON AUTH.USERS;
DROP FUNCTION IF EXISTS HANDLE_NEW_USER();

-- Create improved function to handle new user signup
CREATE OR REPLACE FUNCTION HANDLE_NEW_USER() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with all available data
  INSERT INTO PROFILES (
    ID,
    EMAIL,
    FULL_NAME,
    AVATAR_URL,
    CREATED_AT,
    UPDATED_AT
  ) VALUES (
    NEW.ID,
    NEW.EMAIL,
    COALESCE(NEW.RAW_USER_META_DATA->>'full_name', NEW.EMAIL),
    NEW.RAW_USER_META_DATA->>'avatar_url',
    NOW(),
    NOW()
  ) ON CONFLICT (ID) DO UPDATE SET
    EMAIL = EXCLUDED.EMAIL,
    FULL_NAME = COALESCE(EXCLUDED.FULL_NAME, PROFILES.FULL_NAME),
    AVATAR_URL = COALESCE(EXCLUDED.AVATAR_URL, PROFILES.AVATAR_URL),
    UPDATED_AT = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER ON_AUTH_USER_CREATED 
  AFTER INSERT ON AUTH.USERS 
  FOR EACH ROW 
  EXECUTE FUNCTION HANDLE_NEW_USER();

-- ============================================================================
-- ENSURE ALL REQUIRED FIELDS EXIST
-- ============================================================================

-- Add any missing fields to profiles table
ALTER TABLE PROFILES 
ADD COLUMN IF NOT EXISTS FULL_NAME TEXT;

ALTER TABLE PROFILES 
ADD COLUMN IF NOT EXISTS AVATAR_URL TEXT;

-- Ensure email is not null and unique
ALTER TABLE PROFILES 
ALTER COLUMN EMAIL SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE PROFILES ADD CONSTRAINT profiles_email_key UNIQUE (EMAIL);
  END IF;
END $$;

-- ============================================================================
-- CREATE FUNCTION TO ENSURE PROFILE EXISTS
-- ============================================================================

-- Create a function to ensure a user profile exists
CREATE OR REPLACE FUNCTION ENSURE_USER_PROFILE(user_uuid UUID DEFAULT AUTH.UID())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if profile exists
  IF NOT EXISTS (SELECT 1 FROM PROFILES WHERE ID = user_uuid) THEN
    -- Get user data from auth.users
    INSERT INTO PROFILES (
      ID,
      EMAIL,
      FULL_NAME,
      AVATAR_URL,
      CREATED_AT,
      UPDATED_AT
    )
    SELECT 
      ID,
      EMAIL,
      COALESCE(RAW_USER_META_DATA->>'full_name', EMAIL),
      RAW_USER_META_DATA->>'avatar_url',
      NOW(),
      NOW()
    FROM AUTH.USERS
    WHERE ID = user_uuid;
    
    RETURN TRUE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ENSURE_USER_PROFILE(UUID) TO AUTHENTICATED;

-- ============================================================================
-- UPDATE EXISTING PROFILES WITH MISSING DATA
-- ============================================================================

-- Update profiles that don't have full_name set
UPDATE PROFILES 
SET FULL_NAME = EMAIL 
WHERE FULL_NAME IS NULL OR FULL_NAME = '';

-- ============================================================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS IDX_PROFILES_EMAIL ON PROFILES(EMAIL);

-- Add index for user lookups
CREATE INDEX IF NOT EXISTS IDX_PROFILES_ID ON PROFILES(ID);

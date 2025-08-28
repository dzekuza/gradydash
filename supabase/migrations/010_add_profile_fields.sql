-- Migration to add missing profile fields
-- This adds the fields that the application is trying to use for profile updates

-- Add first_name and last_name fields to profiles table
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS FIRST_NAME TEXT;

-- Add last_name field to profiles table
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS LAST_NAME TEXT;

-- Add bio field to profiles table
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS BIO TEXT;

-- Add phone field to profiles table
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS PHONE TEXT;

-- Add company_name field to profiles table
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS COMPANY_NAME TEXT;

-- Update the handle_new_user function to populate these new fields
CREATE OR REPLACE FUNCTION HANDLE_NEW_USER(
) RETURNS TRIGGER AS
    $$      BEGIN INSERT INTO PROFILES (
        ID,
        EMAIL,
        FULL_NAME,
        FIRST_NAME,
        LAST_NAME,
        BIO,
        PHONE,
        COMPANY_NAME,
        AVATAR_URL
    ) VALUES (
        NEW.ID,
        NEW.EMAIL,
        COALESCE(NEW.RAW_USER_META_DATA->>'full_name', NEW.EMAIL),
        NEW.RAW_USER_META_DATA->>'first_name',
        NEW.RAW_USER_META_DATA->>'last_name',
        NEW.RAW_USER_META_DATA->>'bio',
        NEW.RAW_USER_META_DATA->>'phone',
        NEW.RAW_USER_META_DATA->>'company_name',
        NEW.RAW_USER_META_DATA->>'avatar_url'
    ) ON CONFLICT (
        ID
    ) DO UPDATE SET EMAIL = EXCLUDED.EMAIL, FULL_NAME = COALESCE(
        EXCLUDED.FULL_NAME,
        PROFILES.FULL_NAME
    ), FIRST_NAME = COALESCE(
        EXCLUDED.FIRST_NAME,
        PROFILES.FIRST_NAME
    ), LAST_NAME = COALESCE(
        EXCLUDED.LAST_NAME,
        PROFILES.LAST_NAME
    ), BIO = COALESCE(
        EXCLUDED.BIO,
        PROFILES.BIO
    ), PHONE = COALESCE(
        EXCLUDED.PHONE,
        PROFILES.PHONE
    ), COMPANY_NAME = COALESCE(
        EXCLUDED.COMPANY_NAME,
        PROFILES.COMPANY_NAME
    ), AVATAR_URL = COALESCE(
        EXCLUDED.AVATAR_URL,
        PROFILES.AVATAR_URL
    ), UPDATED_AT = NOW(
    );
    RETURN  NEW;
END;
$$      LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Add comments to document the new fields
COMMENT ON COLUMN PROFILES.FIRST_NAME IS
    'User''s first name';
COMMENT ON COLUMN PROFILES.LAST_NAME IS
    'User''s last name';
COMMENT ON COLUMN PROFILES.BIO IS
    'User''s biography or description';
COMMENT ON COLUMN PROFILES.PHONE IS
    'User''s phone number';
COMMENT ON COLUMN PROFILES.COMPANY_NAME IS
    'User''s company name';
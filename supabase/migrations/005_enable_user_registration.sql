-- Migration to enable user registration and partner creation
-- This allows any registered user to become an admin and create their own partner dashboards

-- Add a new column to track if a user is a partner admin
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS IS_PARTNER_ADMIN BOOLEAN DEFAULT FALSE;

-- Add a new column to track the user's primary partner (the one they created)
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS PRIMARY_PARTNER_ID UUID
        REFERENCES PARTNERS(
            ID
        ) ON DELETE SET NULL;

-- Create a function to handle new user registration and partner creation
CREATE OR REPLACE FUNCTION HANDLE_NEW_USER_REGISTRATION(
) RETURNS TRIGGER AS
    $$           DECLARE NEW_PARTNER_ID UUID;
    COMPANY_NAME TEXT;
BEGIN
 
    -- Get company name from user metadata
    COMPANY_NAME := COALESCE(NEW.RAW_USER_META_DATA->>'company_name', 'My Store');
 
    -- Create a new partner for this user
    INSERT INTO PARTNERS (
        NAME,
        SLUG,
        DESCRIPTION,
        CREATED_BY
    ) VALUES (
        COMPANY_NAME,
        'store-'
        || NEW.ID::TEXT,
        'Store created by '
        || COALESCE(NEW.RAW_USER_META_DATA->>'full_name', NEW.EMAIL),
        NEW.ID
    ) RETURNING ID INTO NEW_PARTNER_ID;
 
    -- Update the profile to mark as partner admin and set primary partner
    UPDATE PROFILES
    SET
        IS_PARTNER_ADMIN = TRUE,
        PRIMARY_PARTNER_ID = NEW_PARTNER_ID,
        UPDATED_AT = NOW(
        )
    WHERE
        ID = NEW.ID;
 
    -- Create membership for the user as admin of their own partner
    INSERT INTO MEMBERSHIPS (
        PARTNER_ID,
        USER_ID,
        ROLE
    ) VALUES (
        NEW_PARTNER_ID,
        NEW.ID,
        'admin'
    );
    RETURN NEW;
END;

$$ LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create a trigger to automatically create partner for new users
-- This will only trigger for users who don't already have a partner
CREATE OR REPLACE TRIGGER ON_NEW_USER_REGISTRATION AFTER INSERT ON AUTH.USERS FOR EACH ROW EXECUTE FUNCTION HANDLE_NEW_USER_REGISTRATION(
);
 
-- Update the existing handle_new_user function to not conflict with the new one
CREATE OR REPLACE FUNCTION HANDLE_NEW_USER() RETURNS TRIGGER AS
    $$      BEGIN INSERT INTO PROFILES (
        ID,
        EMAIL,
        FULL_NAME,
        AVATAR_URL
    ) VALUES (
        NEW.ID,
        NEW.EMAIL,
        COALESCE(NEW.RAW_USER_META_DATA->>'full_name', NEW.EMAIL),
        NEW.RAW_USER_META_DATA->>'avatar_url'
    ) ON CONFLICT (
        ID
    ) DO UPDATE SET EMAIL = EXCLUDED.EMAIL, FULL_NAME = COALESCE(
        EXCLUDED.FULL_NAME,
        PROFILES.FULL_NAME
    ), AVATAR_URL = COALESCE(
        EXCLUDED.AVATAR_URL,
        PROFILES.AVATAR_URL
    ), UPDATED_AT = NOW(
    );
    RETURN  NEW;
END;
$$      LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Add RLS policies for the new columns
-- Users can view their own partner admin status
CREATE  POLICY "Users can view own partner admin status" ON PROFILES FOR
SELECT
    USING (AUTH.UID() = ID);
 
-- Users can update their own partner admin status
CREATE  POLICY "Users can update own partner admin status" ON PROFILES FOR UPDATE USING (AUTH.UID() = ID);
 
-- Add index for better performance
CREATE  INDEX IF NOT EXISTS IDX_PROFILES_IS_PARTNER_ADMIN ON PROFILES(IS_PARTNER_ADMIN);
CREATE INDEX IF NOT EXISTS IDX_PROFILES_PRIMARY_PARTNER_ID ON PROFILES(PRIMARY_PARTNER_ID);
 
-- Update the existing RLS policies to allow partner admins to create partners
-- Allow any authenticated user to create partners (they become partner admins)
DROP POLICY IF EXISTS "Users can create environments" ON PARTNERS;
CREATE POLICY "Users can create partners" ON PARTNERS FOR INSERT WITH CHECK (
    AUTH.UID() IS NOT NULL
);
 
-- Allow partner admins to update their own partners
DROP POLICY IF EXISTS "Users can update their environments" ON PARTNERS;
CREATE POLICY "Partner admins can update their own partners" ON PARTNERS FOR
UPDATE USING (
    CREATED_BY = AUTH.UID() OR EXISTS ( SELECT 1 FROM PROFILES WHERE ID = AUTH.UID() AND IS_PARTNER_ADMIN = TRUE )
);
 
-- Allow system admins to update any partner
CREATE POLICY "System admins can update any partner" ON PARTNERS FOR
UPDATE USING (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS WHERE USER_ID = AUTH.UID() AND ROLE = 'admin' AND PARTNER_ID IS NULL )
);
 
-- Update membership policies to allow partner admins to manage their partners
-- Allow partner admins to create memberships in their own partners
CREATE POLICY "Partner admins can create memberships in their partners" ON MEMBERSHIPS FOR INSERT WITH CHECK (
    EXISTS ( SELECT 1 FROM PARTNERS P WHERE P.ID = MEMBERSHIPS.PARTNER_ID AND P.CREATED_BY = AUTH.UID() )
);
 
-- Allow partner admins to update memberships in their own partners
CREATE POLICY "Partner admins can update memberships in their partners" ON MEMBERSHIPS FOR
UPDATE USING (
    EXISTS ( SELECT 1 FROM PARTNERS P WHERE P.ID = MEMBERSHIPS.PARTNER_ID AND P.CREATED_BY = AUTH.UID() )
);
 
-- Allow partner admins to delete memberships in their own partners
CREATE POLICY "Partner admins can delete memberships in their partners" ON MEMBERSHIPS FOR
DELETE USING ( EXISTS (
    SELECT
        1
    FROM
        PARTNERS P
    WHERE
        P.ID = MEMBERSHIPS.PARTNER_ID
        AND P.CREATED_BY = AUTH.UID()
) );
 
-- Add comments for documentation
COMMENT ON COLUMN PROFILES.IS_PARTNER_ADMIN IS 'Whether this user is a partner admin (can create and manage their own partners)';
COMMENT ON COLUMN PROFILES.PRIMARY_PARTNER_ID IS 'The primary partner that this user created and manages';
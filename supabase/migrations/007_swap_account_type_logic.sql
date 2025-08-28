-- Migration to swap account type logic
-- 'admin' should create partner admin accounts (business owners)
-- 'partner' should create system admin accounts (platform admins)

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS ON_NEW_USER_REGISTRATION ON AUTH.USERS;

DROP FUNCTION IF EXISTS HANDLE_NEW_USER_REGISTRATION();

-- Create a new function that handles different account types
CREATE OR REPLACE FUNCTION HANDLE_NEW_USER_REGISTRATION(
) RETURNS TRIGGER AS
    $$           DECLARE NEW_PARTNER_ID UUID;
    COMPANY_NAME TEXT;
    ACCOUNT_TYPE TEXT;
BEGIN
 
    -- Get account type and company name from user metadata
    ACCOUNT_TYPE := COALESCE(NEW.RAW_USER_META_DATA->>'account_type', 'admin');
    COMPANY_NAME := COALESCE(NEW.RAW_USER_META_DATA->>'company_name', 'My Store');
 
    -- Handle different account types
    IF ACCOUNT_TYPE = 'admin' THEN
 
        -- Business Owner: Create partner and partner admin membership
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
    ELSIF ACCOUNT_TYPE = 'partner' THEN
 
        -- Platform Admin: Create system admin membership (no partner)
        INSERT INTO MEMBERSHIPS (
            PARTNER_ID,
            USER_ID,
            ROLE
        ) VALUES (
            NULL, -- NULL partner_id means system admin
            NEW.ID,
            'admin'
        );
 
        -- Update profile to mark as NOT partner admin
        UPDATE PROFILES
        SET
            IS_PARTNER_ADMIN = FALSE,
            PRIMARY_PARTNER_ID = NULL,
            UPDATED_AT = NOW(
            )
        WHERE
            ID = NEW.ID;
    END IF;

    RETURN NEW;
END;

$$ LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Create the trigger again
CREATE TRIGGER ON_NEW_USER_REGISTRATION AFTER INSERT ON AUTH.USERS FOR EACH ROW EXECUTE FUNCTION HANDLE_NEW_USER_REGISTRATION(
);
 
-- Add comments for documentation
COMMENT ON FUNCTION HANDLE_NEW_USER_REGISTRATION() IS
    'Handles new user registration: admin users become partner admins (business owners), partner users become system admins (platform admins)';
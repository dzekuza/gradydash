-- Manual RLS Fix for Supabase Dashboard
-- Run this SQL in your Supabase SQL Editor to fix the admin status check issues

-- ============================================================================
-- FIX MEMBERSHIPS TABLE POLICIES
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view memberships in their environments" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;

-- Create new policies that allow users to view their own memberships
CREATE POLICY "Users can view own memberships" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (USER_ID = AUTH.UID());

-- Create policy for environment members to view memberships in their environments
CREATE POLICY "Environment members can view memberships" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS M
    WHERE
                           M.ENVIRONMENT_ID = MEMBERSHIPS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
)
  );

-- ============================================================================
-- ADD FALLBACK POLICIES FOR NEW USERS
-- ============================================================================

-- Allow users to create their own profile if it doesn't exist
CREATE POLICY "Users can create own profile" ON PROFILES
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (ID = AUTH.UID());

-- Allow users to create their own memberships (for system admin setup)
CREATE POLICY "Users can create own memberships" ON MEMBERSHIPS
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (USER_ID = AUTH.UID());

-- ============================================================================
-- CREATE HELPER FUNCTION FOR ADMIN CHECKS
-- ============================================================================

-- Create a function to safely check admin status
CREATE OR REPLACE FUNCTION IS_ADMIN(
    USER_UUID UUID DEFAULT AUTH.UID()
) RETURNS BOOLEAN AS
    $$     BEGIN RETURN EXISTS (
        SELECT
            1
        FROM
            MEMBERSHIPS
        WHERE
            USER_ID = USER_UUID
            AND ROLE IN ('admin', 'grady_staff')
    );
END;
$$     LANGUAGE PLPGSQL SECURITY DEFINER;
 
-- Grant execute permission to authenticated users
GRANT  EXECUTE ON

FUNCTION IS_ADMIN(
    UUID
) TO AUTHENTICATED;
 
-- ============================================================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================================================
-- Add index for admin status checks
CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(USER_ID, ROLE) WHERE ROLE IN ('admin', 'grady_staff');
 
-- Add index for system admin memberships (null environment_id)
CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(USER_ID, ROLE) WHERE ENVIRONMENT_ID IS NULL AND ROLE IN ('admin', 'grady_staff');
 
-- Add index for email lookups
CREATE INDEX IF NOT EXISTS IDX_PROFILES_EMAIL ON PROFILES(EMAIL);
 
-- Add index for user lookups
CREATE INDEX IF NOT EXISTS IDX_PROFILES_ID ON PROFILES(ID);
 
-- ============================================================================
-- UPDATE EXISTING PROFILES WITH MISSING DATA
-- ============================================================================
-- Update profiles that don't have full_name set
UPDATE PROFILES
SET
    FULL_NAME = EMAIL
WHERE
    FULL_NAME IS NULL
    OR FULL_NAME = '';
 
-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Check if policies were created successfully
SELECT
    SCHEMANAME,
    TABLENAME,
    POLICYNAME,
    PERMISSIVE,
    ROLES,
    CMD,
    QUAL,
    WITH_CHECK
FROM
    PG_POLICIES
WHERE
    TABLENAME IN ('profiles', 'memberships')
ORDER BY
    TABLENAME,
    POLICYNAME;
 
-- Check if indexes were created successfully
SELECT
    INDEXNAME,
    TABLENAME,
    INDEXDEF
FROM
    PG_INDEXES
WHERE
    TABLENAME IN ('profiles', 'memberships')
ORDER BY
    TABLENAME,
    INDEXNAME;
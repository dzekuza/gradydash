-- Migration to fix admin status check issues
-- This migration addresses the circular dependency issue where admin checks fail
-- because users can't access memberships without being admins

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
-- FIX PROFILES TABLE POLICIES
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;

DROP POLICY IF EXISTS "Admins can update any profile" ON PROFILES;

-- Create new admin policies that don't rely on memberships for basic access
CREATE POLICY "Admins can view all profiles" ON PROFILES
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

CREATE POLICY "Admins can update any profile" ON PROFILES
  FOR UPDATE
  TO AUTHENTICATED
  USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ROLE IN ('admin', 'grady_staff')
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
-- UPDATE EXISTING POLICIES TO USE HELPER FUNCTION
-- ============================================================================
-- Update environment policies to use the helper function
DROP   POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR
SELECT
  TO AUTHENTICATED
  USING (IS_ADMIN());
DROP POLICY IF EXISTS "Admins can create environments" ON ENVIRONMENTS;
CREATE POLICY "Admins can create environments" ON ENVIRONMENTS FOR INSERT TO AUTHENTICATED WITH CHECK (
  IS_ADMIN()
);
DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;
CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR
UPDATE TO AUTHENTICATED USING (
  IS_ADMIN()
);
DROP POLICY IF EXISTS "Admins can delete any environment" ON ENVIRONMENTS;
CREATE POLICY "Admins can delete any environment" ON ENVIRONMENTS FOR
DELETE TO AUTHENTICATED USING (IS_ADMIN());
 
-- ============================================================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================================================
-- Add index for admin status checks
CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(USER_ID, ROLE) WHERE ROLE IN ('admin', 'grady_staff');
 
-- Add index for system admin memberships (null environment_id)
CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(USER_ID, ROLE) WHERE ENVIRONMENT_ID IS NULL AND ROLE IN ('admin', 'grady_staff');
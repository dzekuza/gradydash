-- Migration to support system-wide admin users
-- Allow null environment_id for system-wide admins

-- First, drop the existing unique constraint
ALTER TABLE MEMBERSHIPS DROP CONSTRAINT IF EXISTS MEMBERSHIPS_ENVIRONMENT_ID_USER_ID_KEY;

-- Add a new unique constraint that allows null environment_id
ALTER TABLE MEMBERSHIPS
  ADD CONSTRAINT MEMBERSHIPS_ENVIRONMENT_ID_USER_ID_KEY UNIQUE (
    ENVIRONMENT_ID,
    USER_ID
  ) WHERE ENVIRONMENT_ID IS NOT NULL;

-- Add a unique constraint for system-wide admins (null environment_id)
ALTER TABLE MEMBERSHIPS
  ADD CONSTRAINT MEMBERSHIPS_SYSTEM_ADMIN_UNIQUE UNIQUE (
    USER_ID
  ) WHERE ENVIRONMENT_ID IS NULL;

-- Add a check constraint to ensure only admin and grady_staff can have null environment_id
ALTER TABLE MEMBERSHIPS
  ADD CONSTRAINT MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK CHECK (
    (ENVIRONMENT_ID IS NULL AND ROLE IN ('admin', 'grady_staff')) OR ENVIRONMENT_ID IS NOT NULL
  );

-- Drop existing policies that might cause conflicts
DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;

DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;

DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;

-- Update RLS policies to handle system-wide admins
CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS
  FOR SELECT USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND ( (M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff'))
    OR (M.ENVIRONMENT_ID = ENVIRONMENTS.ID) )
)
  );

-- Add policy for system-wide admins to create environments
CREATE POLICY "System admins can create environments" ON ENVIRONMENTS
  FOR INSERT WITH CHECK (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to update environments
CREATE POLICY "System admins can update environments" ON ENVIRONMENTS
  FOR UPDATE USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to delete environments
CREATE POLICY "System admins can delete environments" ON ENVIRONMENTS
  FOR DELETE USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to manage all memberships
CREATE POLICY "System admins can manage all memberships" ON MEMBERSHIPS
  FOR ALL USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS ADMIN_MEMBERSHIP
  WHERE
     ADMIN_MEMBERSHIP.USER_ID = AUTH.UID()
    AND ADMIN_MEMBERSHIP.ENVIRONMENT_ID IS NULL
    AND ADMIN_MEMBERSHIP.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to manage all products
CREATE POLICY "System admins can manage all products" ON PRODUCTS
  FOR ALL USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to manage all locations
CREATE POLICY "System admins can manage all locations" ON LOCATIONS
  FOR ALL USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );

-- Add policy for system-wide admins to manage all invites
CREATE POLICY "System admins can manage all invites" ON ENVIRONMENT_INVITES
  FOR ALL USING (
    EXISTS (
  SELECT
     1
  FROM
     MEMBERSHIPS M
  WHERE
     M.USER_ID = AUTH.UID()
    AND M.ENVIRONMENT_ID IS NULL
    AND M.ROLE IN ('admin', 'grady_staff')
)
  );
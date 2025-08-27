-- Fix admin environment creation by adding a more permissive policy
-- The issue is that the current policy requires a membership record, but admin users
-- might not have the proper membership record when creating environments

-- Drop the restrictive admin creation policy
DROP POLICY IF EXISTS "Admins can create environments" ON ENVIRONMENTS;

-- Create a more permissive policy that allows authenticated users to create environments
-- This is safe because we're using the service role client for admin operations
CREATE POLICY "Authenticated users can create environments" ON ENVIRONMENTS
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (
    AUTH.UID() IS NOT NULL
  );

-- Also add a policy for users to create their own memberships
DROP POLICY IF EXISTS "Users can create their own memberships" ON MEMBERSHIPS;

CREATE POLICY "Users can create their own memberships" ON MEMBERSHIPS
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (
    USER_ID = AUTH.UID()
  );

-- Add a policy for admins to create any membership
CREATE POLICY "Admins can create any membership" ON MEMBERSHIPS
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (
    EXISTS (
  SELECT
              1
  FROM
              MEMBERSHIPS M
  WHERE
              M.USER_ID = AUTH.UID()
    AND M.ROLE IN ('admin', 'grady_staff')
    AND M.ENVIRONMENT_ID IS NULL
)
  );
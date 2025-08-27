-- Fix admin membership access issue
-- The problem is that admin users can't access their own admin membership
-- because the RLS policy requires them to already have admin access

-- Drop the problematic admin policy that creates a circular dependency
DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;

-- Create a new policy that allows users to view their own memberships
CREATE POLICY "Users can view own memberships" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    USER_ID = AUTH.UID()
  );

-- Recreate the admin policy for viewing all memberships (but not their own)
CREATE POLICY "Admins can view all other memberships" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    USER_ID != AUTH.UID() AND
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
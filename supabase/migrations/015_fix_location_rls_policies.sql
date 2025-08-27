-- Fix RLS policies for locations table
-- Allow users to manage locations in their environments

-- Drop the overly restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;

-- Create new policies that allow users to manage locations in their environments
CREATE POLICY "Users can view locations in their environments" ON LOCATIONS FOR SELECT USING (
  EXISTS (
    SELECT
         1
    FROM
         MEMBERSHIPS M
    WHERE
         M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
)
);

CREATE POLICY "Users can create locations in their environments" ON LOCATIONS FOR INSERT WITH CHECK (
  EXISTS (
    SELECT
         1
    FROM
         MEMBERSHIPS M
    WHERE
         M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
)
);

CREATE POLICY "Users can update locations in their environments" ON LOCATIONS FOR UPDATE USING (
  EXISTS (
    SELECT
         1
    FROM
         MEMBERSHIPS M
    WHERE
         M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
)
);

CREATE POLICY "Users can delete locations in their environments" ON LOCATIONS FOR DELETE USING (
  EXISTS (
    SELECT
         1
    FROM
         MEMBERSHIPS M
    WHERE
         M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
)
);

-- Keep the admin policy for viewing all locations
CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
  EXISTS (
    SELECT
         1
    FROM
         MEMBERSHIPS M
    WHERE
         M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
)
);
-- Fix environment access policies
-- Allow authenticated users to create environments
CREATE POLICY "Users can create environments" ON ENVIRONMENTS
  FOR INSERT WITH CHECK (AUTH.UID() IS NOT NULL);

-- Allow users to update environments they created
CREATE POLICY "Users can update their environments" ON ENVIRONMENTS
  FOR UPDATE USING (CREATED_BY = AUTH.UID());

-- Allow admins to update any environment
CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS
  FOR UPDATE USING (
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

-- Allow users to create memberships in environments they created
CREATE POLICY "Users can create memberships in their environments" ON MEMBERSHIPS
  FOR INSERT WITH CHECK (
    EXISTS (
  SELECT
     1
  FROM
     ENVIRONMENTS E
  WHERE
     E.ID = MEMBERSHIPS.ENVIRONMENT_ID
    AND E.CREATED_BY = AUTH.UID()
)
  );

-- Allow users to create their own memberships (for self-joining)
CREATE POLICY "Users can create their own memberships" ON MEMBERSHIPS
  FOR INSERT WITH CHECK (USER_ID = AUTH.UID());
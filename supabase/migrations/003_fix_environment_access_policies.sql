-- Fix environment access policies
-- Allow authenticated users to create environments
CREATE POLICY "Users can create environments" ON environments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update environments they created
CREATE POLICY "Users can update their environments" ON environments
  FOR UPDATE USING (created_by = auth.uid());

-- Allow admins to update any environment
CREATE POLICY "Admins can update any environment" ON environments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Allow users to create memberships in environments they created
CREATE POLICY "Users can create memberships in their environments" ON memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM environments e
      WHERE e.id = memberships.environment_id AND e.created_by = auth.uid()
    )
  );

-- Allow users to create their own memberships (for self-joining)
CREATE POLICY "Users can create their own memberships" ON memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

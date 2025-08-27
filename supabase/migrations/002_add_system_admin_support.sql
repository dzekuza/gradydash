-- Migration to support system-wide admin users
-- Allow null environment_id for system-wide admins

-- First, drop the existing unique constraint
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_environment_id_user_id_key;

-- Add a new unique constraint that allows null environment_id
ALTER TABLE memberships 
    ADD CONSTRAINT memberships_environment_id_user_id_key 
    UNIQUE (environment_id, user_id) 
    WHERE environment_id IS NOT NULL;

-- Add a unique constraint for system-wide admins (null environment_id)
ALTER TABLE memberships
    ADD CONSTRAINT memberships_system_admin_unique 
    UNIQUE (user_id) 
    WHERE environment_id IS NULL;

-- Add a check constraint to ensure only grady_admin and grady_staff can have null environment_id
ALTER TABLE memberships
    ADD CONSTRAINT memberships_system_admin_role_check 
    CHECK (
        (environment_id IS NULL AND role IN ('grady_admin', 'grady_staff')) OR 
        environment_id IS NOT NULL
    );

-- Drop existing policies that might cause conflicts
DROP POLICY IF EXISTS "Admins can view all environments" ON environments;
DROP POLICY IF EXISTS "System admins can create environments" ON environments;
DROP POLICY IF EXISTS "System admins can update environments" ON environments;
DROP POLICY IF EXISTS "System admins can delete environments" ON environments;
DROP POLICY IF EXISTS "System admins can manage all memberships" ON memberships;
DROP POLICY IF EXISTS "System admins can manage all products" ON products;
DROP POLICY IF EXISTS "System admins can manage all locations" ON locations;
DROP POLICY IF EXISTS "System admins can manage all invites" ON environment_invites;

-- Update RLS policies to handle system-wide admins
CREATE POLICY "Admins can view all environments" ON environments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND (
          (m.environment_id IS NULL AND m.role IN ('grady_admin', 'grady_staff')) OR
          (m.environment_id = environments.id)
        )
    )
  );

-- Add policy for system-wide admins to create environments
CREATE POLICY "System admins can create environments" ON environments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to update environments
CREATE POLICY "System admins can update environments" ON environments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to delete environments
CREATE POLICY "System admins can delete environments" ON environments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to manage all memberships
CREATE POLICY "System admins can manage all memberships" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships admin_membership
      WHERE admin_membership.user_id = auth.uid() 
        AND admin_membership.environment_id IS NULL 
        AND admin_membership.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to manage all products
CREATE POLICY "System admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to manage all locations
CREATE POLICY "System admins can manage all locations" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Add policy for system-wide admins to manage all invites
CREATE POLICY "System admins can manage all invites" ON environment_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() 
        AND m.environment_id IS NULL 
        AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

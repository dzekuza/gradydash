-- Consolidate roles to two values: 'admin' and 'store_manager'
-- 1) Replace ROLE enum values and migrate data
-- 2) Update constraints and RLS policies to use new roles

BEGIN;

-- 1) Replace ROLE enum with new values
-- Rename old type to keep ability to cast
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    EXECUTE 'ALTER TYPE role RENAME TO role_old';
  END IF;
END $$;

-- Create new ROLE enum
CREATE TYPE role AS ENUM ('admin', 'store_manager');

-- memberships.role: update type and map values
ALTER TABLE memberships ALTER COLUMN role DROP DEFAULT;
ALTER TABLE memberships
  ALTER COLUMN role TYPE role
  USING (
    CASE 
      WHEN role::text IN ('grady_admin','grady_staff') THEN 'admin'::role
      ELSE 'store_manager'::role
    END
  );
ALTER TABLE memberships ALTER COLUMN role SET DEFAULT 'store_manager';

-- environment_invites.role: update type and map values
ALTER TABLE environment_invites
  ALTER COLUMN role TYPE role
  USING (
    CASE 
      WHEN role::text IN ('grady_admin','grady_staff') THEN 'admin'::role
      ELSE 'store_manager'::role
    END
  );

-- 2) Constraints: ensure only admins may have NULL environment_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'memberships_system_admin_role_check'
  ) THEN
    EXECUTE 'ALTER TABLE memberships DROP CONSTRAINT memberships_system_admin_role_check';
  END IF;
END $$;

ALTER TABLE memberships
  ADD CONSTRAINT memberships_system_admin_role_check 
  CHECK (
    (environment_id IS NULL AND role = 'admin') OR environment_id IS NOT NULL
  );

-- 3) Policies: drop old ones referencing legacy roles and recreate with new ones

-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Environments
DROP POLICY IF EXISTS "Admins can view all environments" ON environments;
CREATE POLICY "Admins can view all environments" ON environments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND (
        (m.environment_id IS NULL AND m.role = 'admin') OR
        (m.environment_id = environments.id)
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update any environment" ON environments;
CREATE POLICY "Admins can update any environment" ON environments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- System admin global policies (from 002 migration) rewritten for 'admin'
DROP POLICY IF EXISTS "System admins can create environments" ON environments;
CREATE POLICY "System admins can create environments" ON environments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can update environments" ON environments;
CREATE POLICY "System admins can update environments" ON environments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can delete environments" ON environments;
CREATE POLICY "System admins can delete environments" ON environments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all memberships" ON memberships;
CREATE POLICY "System admins can manage all memberships" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships admin_membership
      WHERE admin_membership.user_id = auth.uid() 
        AND admin_membership.environment_id IS NULL 
        AND admin_membership.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all products" ON products;
CREATE POLICY "System admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all locations" ON locations;
CREATE POLICY "System admins can manage all locations" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System admins can manage all invites" ON environment_invites;
CREATE POLICY "System admins can manage all invites" ON environment_invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.environment_id IS NULL AND m.role = 'admin'
    )
  );

-- Environment-level manager policies (replace legacy 'Staff' policies)
-- Products
DROP POLICY IF EXISTS "Staff can modify products" ON products;
CREATE POLICY "Managers can modify products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = products.environment_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Locations
DROP POLICY IF EXISTS "Staff can modify locations" ON locations;
CREATE POLICY "Managers can modify locations" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = locations.environment_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Product status history
DROP POLICY IF EXISTS "Staff can create product status history" ON product_status_history;
CREATE POLICY "Managers can create product status history" ON product_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = product_status_history.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Product comments
DROP POLICY IF EXISTS "Staff can update any comment" ON product_comments;
CREATE POLICY "Managers can update any comment" ON product_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = product_comments.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can delete any comment" ON product_comments;
CREATE POLICY "Managers can delete any comment" ON product_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = product_comments.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Product images
DROP POLICY IF EXISTS "Staff can create product images" ON product_images;
CREATE POLICY "Managers can create product images" ON product_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = product_images.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can delete any image" ON product_images;
CREATE POLICY "Managers can delete any image" ON product_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = product_images.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Sales
DROP POLICY IF EXISTS "Staff can create sales records" ON sales;
CREATE POLICY "Managers can create sales records" ON sales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = sales.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can update sales records" ON sales;
CREATE POLICY "Managers can update sales records" ON sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = sales.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can delete sales records" ON sales;
CREATE POLICY "Managers can delete sales records" ON sales
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN memberships m ON m.environment_id = p.environment_id
      WHERE p.id = sales.product_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- Environment invites
DROP POLICY IF EXISTS "Staff can create environment invites" ON environment_invites;
CREATE POLICY "Managers can create environment invites" ON environment_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = environment_invites.environment_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can update environment invites" ON environment_invites;
CREATE POLICY "Managers can update environment invites" ON environment_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = environment_invites.environment_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

DROP POLICY IF EXISTS "Staff can delete environment invites" ON environment_invites;
CREATE POLICY "Managers can delete environment invites" ON environment_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = environment_invites.environment_id
        AND m.user_id = auth.uid()
        AND m.role = 'store_manager'
    )
  );

-- 4) Drop old enum type
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_old') THEN
    EXECUTE 'DROP TYPE role_old';
  END IF;
END $$;

COMMIT;


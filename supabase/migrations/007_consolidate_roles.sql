-- Migration to consolidate roles from 4 values to 2 values
-- This migration updates the ROLE enum and migrates existing data

-- Step 1: Create a new enum with only two values
CREATE TYPE ROLE_NEW AS
  ENUM ('admin', 'store_manager');
 
  -- Step 2: Add a new column with the new enum type
  ALTER TABLE MEMBERSHIPS
    ADD COLUMN ROLE_NEW ROLE_NEW;
    ALTER TABLE ENVIRONMENT_INVITES ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 3: Migrate existing data
    -- Map old roles to new roles:
    -- admin, grady_staff -> admin
    -- reseller_manager, reseller_staff -> store_manager
    UPDATE MEMBERSHIPS SET ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
    UPDATE ENVIRONMENT_INVITES SET ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
 
    -- Step 4: Drop the old column and rename the new one
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET NOT NULL;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES ALTER COLUMN ROLE SET NOT NULL;
 
    -- Step 5: Drop the old enum and rename the new one
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 6: Update the default value for memberships
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 7: Update the system admin constraint to only allow 'admin' role
    ALTER TABLE MEMBERSHIPS DROP CONSTRAINT IF EXISTS MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK;
    ALTER TABLE MEMBERSHIPS ADD CONSTRAINT MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK CHECK (
      (ENVIRONMENT_ID IS NULL AND ROLE = 'admin') OR ENVIRONMENT_ID IS NOT NULL
    );
 
    -- Step 8: Update RLS policies to use new role values
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role values
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can create environments" ON ENVIRONMENTS FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can update environments" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can delete environments" ON ENVIRONMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS ADMIN_MEMBERSHIP WHERE ADMIN_MEMBERSHIP.USER_ID = AUTH.UID() AND ADMIN_MEMBERSHIP.ENVIRONMENT_ID IS NULL AND ADMIN_MEMBERSHIP.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
 
    -- Step 9: Update other policies that reference old roles
    -- Update product management policies
    DROP POLICY IF EXISTS "Staff can modify products" ON PRODUCTS;
    CREATE POLICY "Staff can modify products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update location management policies
    DROP POLICY IF EXISTS "Staff can modify locations" ON LOCATIONS;
    CREATE POLICY "Staff can modify locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update invite management policies
    DROP POLICY IF EXISTS "Staff can create environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can create environment invites" ON ENVIRONMENT_INVITES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can update environment invites" ON ENVIRONMENT_INVITES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can delete environment invites" ON ENVIRONMENT_INVITES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update status history policies
    DROP POLICY IF EXISTS "Staff can create product status history" ON PRODUCT_STATUS_HISTORY;
    CREATE POLICY "Staff can create product status history" ON PRODUCT_STATUS_HISTORY FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update comment policies
    DROP POLICY IF EXISTS "Staff can update any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can update any comment" ON PRODUCT_COMMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can delete any comment" ON PRODUCT_COMMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update image policies
    DROP POLICY IF EXISTS "Staff can delete any image" ON PRODUCT_IMAGES;
    CREATE POLICY "Staff can delete any image" ON PRODUCT_IMAGES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_IMAGES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update sales policies
    DROP POLICY IF EXISTS "Staff can create sales records" ON SALES;
    CREATE POLICY "Staff can create sales records" ON SALES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update sales records" ON SALES;
    CREATE POLICY "Staff can update sales records" ON SALES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete sales records" ON SALES;
    CREATE POLICY "Staff can delete sales records" ON SALES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    ALTER TABLE ENVIRONMENT_INVITES
    ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 3: Migrate existing data
    -- Map old roles to new roles:
    -- admin, grady_staff -> admin
    -- reseller_manager, reseller_staff -> store_manager
    UPDATE MEMBERSHIPS SET ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
    UPDATE ENVIRONMENT_INVITES SET ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
 
    -- Step 4: Drop the old column and rename the new one
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET NOT NULL;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES ALTER COLUMN ROLE SET NOT NULL;
 
    -- Step 5: Drop the old enum and rename the new one
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 6: Update the default value for memberships
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 7: Update the system admin constraint to only allow 'admin' role
    ALTER TABLE MEMBERSHIPS DROP CONSTRAINT IF EXISTS MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK;
    ALTER TABLE MEMBERSHIPS ADD CONSTRAINT MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK CHECK (
      (ENVIRONMENT_ID IS NULL AND ROLE = 'admin') OR ENVIRONMENT_ID IS NOT NULL
    );
 
    -- Step 8: Update RLS policies to use new role values
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role values
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can create environments" ON ENVIRONMENTS FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can update environments" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can delete environments" ON ENVIRONMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS ADMIN_MEMBERSHIP WHERE ADMIN_MEMBERSHIP.USER_ID = AUTH.UID() AND ADMIN_MEMBERSHIP.ENVIRONMENT_ID IS NULL AND ADMIN_MEMBERSHIP.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
 
    -- Step 9: Update other policies that reference old roles
    -- Update product management policies
    DROP POLICY IF EXISTS "Staff can modify products" ON PRODUCTS;
    CREATE POLICY "Staff can modify products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update location management policies
    DROP POLICY IF EXISTS "Staff can modify locations" ON LOCATIONS;
    CREATE POLICY "Staff can modify locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update invite management policies
    DROP POLICY IF EXISTS "Staff can create environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can create environment invites" ON ENVIRONMENT_INVITES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can update environment invites" ON ENVIRONMENT_INVITES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can delete environment invites" ON ENVIRONMENT_INVITES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update status history policies
    DROP POLICY IF EXISTS "Staff can create product status history" ON PRODUCT_STATUS_HISTORY;
    CREATE POLICY "Staff can create product status history" ON PRODUCT_STATUS_HISTORY FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update comment policies
    DROP POLICY IF EXISTS "Staff can update any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can update any comment" ON PRODUCT_COMMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can delete any comment" ON PRODUCT_COMMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update image policies
    DROP POLICY IF EXISTS "Staff can delete any image" ON PRODUCT_IMAGES;
    CREATE POLICY "Staff can delete any image" ON PRODUCT_IMAGES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_IMAGES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update sales policies
    DROP POLICY IF EXISTS "Staff can create sales records" ON SALES;
    CREATE POLICY "Staff can create sales records" ON SALES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update sales records" ON SALES;
    CREATE POLICY "Staff can update sales records" ON SALES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete sales records" ON SALES;
    CREATE POLICY "Staff can delete sales records" ON SALES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Step 3: Migrate existing data
  -- Map old roles to new roles:
  -- admin, grady_staff -> admin
  -- reseller_manager, reseller_staff -> store_manager
  UPDATE MEMBERSHIPS
  SET
    ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
  UPDATE ENVIRONMENT_INVITES
  SET
    ROLE_NEW = CASE WHEN ROLE IN (
      'admin',
      'grady_staff'
    ) THEN 'admin'::ROLE_NEW WHEN ROLE IN (
      'reseller_manager',
      'reseller_staff'
    ) THEN 'store_manager'::ROLE_NEW ELSE 'store_manager'::ROLE_NEW END;
 
  -- Step 4: Drop the old column and rename the new one
  ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
  ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
  ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET NOT NULL;
  ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
  ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
  ALTER TABLE ENVIRONMENT_INVITES ALTER COLUMN ROLE SET NOT NULL;
 
  -- Step 5: Drop the old enum and rename the new one
  DROP TYPE ROLE;
  ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
  -- Step 6: Update the default value for memberships
  ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
  -- Step 7: Update the system admin constraint to only allow 'admin' role
  ALTER TABLE MEMBERSHIPS DROP CONSTRAINT IF EXISTS MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK;
  ALTER TABLE MEMBERSHIPS
    ADD CONSTRAINT MEMBERSHIPS_SYSTEM_ADMIN_ROLE_CHECK CHECK (
      (ENVIRONMENT_ID IS NULL AND ROLE = 'admin') OR ENVIRONMENT_ID IS NOT NULL
    );
 
    -- Step 8: Update RLS policies to use new role values
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role values
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can create environments" ON ENVIRONMENTS FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can update environments" ON ENVIRONMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can delete environments" ON ENVIRONMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS ADMIN_MEMBERSHIP WHERE ADMIN_MEMBERSHIP.USER_ID = AUTH.UID() AND ADMIN_MEMBERSHIP.ENVIRONMENT_ID IS NULL AND ADMIN_MEMBERSHIP.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
    CREATE POLICY "System admins can manage all invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
    );
 
    -- Step 9: Update other policies that reference old roles
    -- Update product management policies
    DROP POLICY IF EXISTS "Staff can modify products" ON PRODUCTS;
    CREATE POLICY "Staff can modify products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update location management policies
    DROP POLICY IF EXISTS "Staff can modify locations" ON LOCATIONS;
    CREATE POLICY "Staff can modify locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update invite management policies
    DROP POLICY IF EXISTS "Staff can create environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can create environment invites" ON ENVIRONMENT_INVITES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can update environment invites" ON ENVIRONMENT_INVITES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete environment invites" ON ENVIRONMENT_INVITES;
    CREATE POLICY "Staff can delete environment invites" ON ENVIRONMENT_INVITES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update status history policies
    DROP POLICY IF EXISTS "Staff can create product status history" ON PRODUCT_STATUS_HISTORY;
    CREATE POLICY "Staff can create product status history" ON PRODUCT_STATUS_HISTORY FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update comment policies
    DROP POLICY IF EXISTS "Staff can update any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can update any comment" ON PRODUCT_COMMENTS FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete any comment" ON PRODUCT_COMMENTS;
    CREATE POLICY "Staff can delete any comment" ON PRODUCT_COMMENTS FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update image policies
    DROP POLICY IF EXISTS "Staff can delete any image" ON PRODUCT_IMAGES;
    CREATE POLICY "Staff can delete any image" ON PRODUCT_IMAGES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_IMAGES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Update sales policies
    DROP POLICY IF EXISTS "Staff can create sales records" ON SALES;
    CREATE POLICY "Staff can create sales records" ON SALES FOR INSERT WITH CHECK (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can update sales records" ON SALES;
    CREATE POLICY "Staff can update sales records" ON SALES FOR UPDATE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
    DROP POLICY IF EXISTS "Staff can delete sales records" ON SALES;
    CREATE POLICY "Staff can delete sales records" ON SALES FOR DELETE USING (
      EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
    );
 
    -- Step 8: Update RLS policies to use new role values
  -- Drop existing policies that reference old roles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
  DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;
 
  -- Recreate policies with new role values
  CREATE POLICY "Admins can view all profiles" ON PROFILES FOR
  SELECT
    USING ( EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ) );
  CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR
  SELECT
    USING ( EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ) );
  CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR
  UPDATE USING (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
  );
  CREATE POLICY "System admins can create environments" ON ENVIRONMENTS FOR INSERT WITH CHECK (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
  );
  CREATE POLICY "System admins can update environments" ON ENVIRONMENTS FOR
  UPDATE USING (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ENVIRONMENT_ID IS NULL AND M.ROLE = 'admin' )
  );
  CREATE POLICY "System admins can delete environments" ON ENVIRONMENTS FOR
  DELETE USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ENVIRONMENT_ID IS NULL
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "System admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS ADMIN_MEMBERSHIP
    WHERE
      ADMIN_MEMBERSHIP.USER_ID = AUTH.UID()
      AND ADMIN_MEMBERSHIP.ENVIRONMENT_ID IS NULL
      AND ADMIN_MEMBERSHIP.ROLE = 'admin'
  ) );
  CREATE POLICY "System admins can manage all products" ON PRODUCTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ENVIRONMENT_ID IS NULL
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "System admins can manage all locations" ON LOCATIONS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ENVIRONMENT_ID IS NULL
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "System admins can manage all invites" ON ENVIRONMENT_INVITES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ENVIRONMENT_ID IS NULL
      AND M.ROLE = 'admin'
  ) );
 
  -- Step 9: Update other policies that reference old roles
  -- Update product management policies
  DROP POLICY IF EXISTS "Staff can modify products" ON PRODUCTS;
  CREATE POLICY "Staff can modify products" ON PRODUCTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
 
  -- Update location management policies
  DROP POLICY IF EXISTS "Staff can modify locations" ON LOCATIONS;
  CREATE POLICY "Staff can modify locations" ON LOCATIONS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
 
  -- Update invite management policies
  DROP POLICY IF EXISTS "Staff can create environment invites" ON ENVIRONMENT_INVITES;
  CREATE POLICY "Staff can create environment invites" ON ENVIRONMENT_INVITES FOR INSERT WITH CHECK (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
  DROP POLICY IF EXISTS "Staff can update environment invites" ON ENVIRONMENT_INVITES;
  CREATE POLICY "Staff can update environment invites" ON ENVIRONMENT_INVITES FOR
  UPDATE USING (
    EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
  DROP POLICY IF EXISTS "Staff can delete environment invites" ON ENVIRONMENT_INVITES;
  CREATE POLICY "Staff can delete environment invites" ON ENVIRONMENT_INVITES FOR
  DELETE USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
 
  -- Update status history policies
  DROP POLICY IF EXISTS "Staff can create product status history" ON PRODUCT_STATUS_HISTORY;
  CREATE POLICY "Staff can create product status history" ON PRODUCT_STATUS_HISTORY FOR INSERT WITH CHECK (
    EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
 
  -- Update comment policies
  DROP POLICY IF EXISTS "Staff can update any comment" ON PRODUCT_COMMENTS;
  CREATE POLICY "Staff can update any comment" ON PRODUCT_COMMENTS FOR
  UPDATE USING (
    EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
  DROP POLICY IF EXISTS "Staff can delete any comment" ON PRODUCT_COMMENTS;
  CREATE POLICY "Staff can delete any comment" ON PRODUCT_COMMENTS FOR
  DELETE USING ( EXISTS (
    SELECT
      1
    FROM
      PRODUCTS P
      JOIN MEMBERSHIPS M
      ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
    WHERE
      P.ID = PRODUCT_COMMENTS.PRODUCT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
 
  -- Update image policies
  DROP POLICY IF EXISTS "Staff can delete any image" ON PRODUCT_IMAGES;
  CREATE POLICY "Staff can delete any image" ON PRODUCT_IMAGES FOR
  DELETE USING ( EXISTS (
    SELECT
      1
    FROM
      PRODUCTS P
      JOIN MEMBERSHIPS M
      ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
    WHERE
      P.ID = PRODUCT_IMAGES.PRODUCT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
 
  -- Update sales policies
  DROP POLICY IF EXISTS "Staff can create sales records" ON SALES;
  CREATE POLICY "Staff can create sales records" ON SALES FOR INSERT WITH CHECK (
    EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
  DROP POLICY IF EXISTS "Staff can update sales records" ON SALES;
  CREATE POLICY "Staff can update sales records" ON SALES FOR
  UPDATE USING (
    EXISTS ( SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager') )
  );
  DROP POLICY IF EXISTS "Staff can delete sales records" ON SALES;
  CREATE POLICY "Staff can delete sales records" ON SALES FOR
  DELETE USING ( EXISTS (
    SELECT
      1
    FROM
      PRODUCTS P
      JOIN MEMBERSHIPS M
      ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
    WHERE
      P.ID = SALES.PRODUCT_ID
      AND M.USER_ID = AUTH.UID()
      AND M.ROLE IN ('admin', 'store_manager')
  ) );
-- Migration to simplify role system from 4 roles to 2 roles
-- Replace: admin, grady_staff, reseller_manager, reseller_staff
-- With: admin, store_manager

-- Step 1: Create new role enum
CREATE TYPE ROLE_NEW AS
  ENUM ('admin', 'store_manager');
 
  -- Step 2: Add new role column to memberships table
  ALTER TABLE MEMBERSHIPS
    ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 3: Add new role column to environment_invites table
    ALTER TABLE ENVIRONMENT_INVITES ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 3: Add new role column to environment_invites table
    ALTER TABLE ENVIRONMENT_INVITES ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 3: Add new role column to environment_invites table
  ALTER TABLE ENVIRONMENT_INVITES
    ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 3: Add new role column to environment_invites table
    ALTER TABLE ENVIRONMENT_INVITES ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 4: Migrate existing data
  -- Map old roles to new roles:
  -- admin -> admin
  -- grady_staff -> admin
  -- reseller_manager -> store_manager
  -- reseller_staff -> store_manager
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
 
  -- Step 5: Drop old role columns
  ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
  ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
  -- Step 6: Rename new columns to original names
  ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
  ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
  -- Step 7: Drop old enum and rename new enum
  DROP TYPE ROLE;
  ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
  -- Step 8: Set default values
  ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
  -- Step 9: Update RLS policies to use new roles
  -- Drop existing policies that reference old roles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
  DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
  DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
  -- Recreate policies with new role names
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
  CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR
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
  CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR
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
  CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all products" ON PRODUCTS FOR
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
  CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR
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
  CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR
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
  CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR
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
  CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all sales" ON SALES FOR
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
  CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR
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
  CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
 
  -- Step 10: Update indexes to use new role names
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS( USER_ID, ROLE ) WHERE ROLE = 'admin';
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS( USER_ID, ROLE ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
  -- Step 3: Add new role column to environment_invites table
  ALTER TABLE ENVIRONMENT_INVITES
    ADD COLUMN ROLE_NEW ROLE_NEW;
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 4: Migrate existing data
    -- Map old roles to new roles:
    -- admin -> admin
    -- grady_staff -> admin
    -- reseller_manager -> store_manager
    -- reseller_staff -> store_manager
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
 
    -- Step 5: Drop old role columns
    ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
    ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
    -- Step 6: Rename new columns to original names
    ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
    ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
    -- Step 7: Drop old enum and rename new enum
    DROP TYPE ROLE;
    ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
    -- Step 8: Set default values
    ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
    -- Step 9: Update RLS policies to use new roles
    -- Drop existing policies that reference old roles
    DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
    DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
    DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
    DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
    DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
    DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
    DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
    DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
    DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
    DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
    DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
    -- Recreate policies with new role names
    CREATE POLICY "Admins can view all profiles" ON PROFILES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all sales" ON SALES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR SELECT USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
    CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (
      EXISTS ( SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin' )
    );
 
    -- Step 10: Update indexes to use new role names
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
    DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ROLE = 'admin';
    CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(
      USER_ID,
      ROLE
    ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
    -- Step 4: Migrate existing data
  -- Map old roles to new roles:
  -- admin -> admin
  -- grady_staff -> admin
  -- reseller_manager -> store_manager
  -- reseller_staff -> store_manager
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
 
  -- Step 5: Drop old role columns
  ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
  ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
  -- Step 6: Rename new columns to original names
  ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
  ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
  -- Step 7: Drop old enum and rename new enum
  DROP TYPE ROLE;
  ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
  -- Step 8: Set default values
  ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
  -- Step 9: Update RLS policies to use new roles
  -- Drop existing policies that reference old roles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
  DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
  DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
  -- Recreate policies with new role names
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
  CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR
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
  CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR
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
  CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all products" ON PRODUCTS FOR
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
  CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR
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
  CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR
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
  CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR
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
  CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all sales" ON SALES FOR
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
  CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
  CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR
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
  CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING ( EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ) );
 
  -- Step 10: Update indexes to use new role names
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS( USER_ID, ROLE ) WHERE ROLE = 'admin';
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS( USER_ID, ROLE ) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
 
  -- Step 4: Migrate existing data
  -- Map old roles to new roles:
  -- admin -> admin
  -- grady_staff -> admin
  -- reseller_manager -> store_manager
  -- reseller_staff -> store_manager
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
 
  -- Step 5: Drop old role columns
  ALTER TABLE MEMBERSHIPS DROP COLUMN ROLE;
  ALTER TABLE ENVIRONMENT_INVITES DROP COLUMN ROLE;
 
  -- Step 6: Rename new columns to original names
  ALTER TABLE MEMBERSHIPS RENAME COLUMN ROLE_NEW TO ROLE;
  ALTER TABLE ENVIRONMENT_INVITES RENAME COLUMN ROLE_NEW TO ROLE;
 
  -- Step 7: Drop old enum and rename new enum
  DROP TYPE ROLE;
  ALTER TYPE ROLE_NEW RENAME TO ROLE;
 
  -- Step 8: Set default values
  ALTER TABLE MEMBERSHIPS ALTER COLUMN ROLE SET DEFAULT 'store_manager';
 
  -- Step 9: Update RLS policies to use new roles
  -- Drop existing policies that reference old roles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;
  DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can manage all environments" ON ENVIRONMENTS;
  DROP POLICY IF EXISTS "Admins can view all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can manage all memberships" ON MEMBERSHIPS;
  DROP POLICY IF EXISTS "Admins can view all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can manage all locations" ON LOCATIONS;
  DROP POLICY IF EXISTS "Admins can view all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;
  DROP POLICY IF EXISTS "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY;
  DROP POLICY IF EXISTS "Admins can view all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can manage all product comments" ON PRODUCT_COMMENTS;
  DROP POLICY IF EXISTS "Admins can view all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;
  DROP POLICY IF EXISTS "Admins can view all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can manage all sales" ON SALES;
  DROP POLICY IF EXISTS "Admins can view all environment invites" ON ENVIRONMENT_INVITES;
  DROP POLICY IF EXISTS "Admins can manage all environment invites" ON ENVIRONMENT_INVITES;
 
  -- Recreate policies with new role names
  CREATE POLICY "Admins can view all profiles" ON PROFILES FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all environments" ON ENVIRONMENTS FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all memberships" ON MEMBERSHIPS FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all locations" ON LOCATIONS FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all locations" ON LOCATIONS FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all products" ON PRODUCTS FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all products" ON PRODUCTS FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all product status history" ON PRODUCT_STATUS_HISTORY FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all product comments" ON PRODUCT_COMMENTS FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all product images" ON PRODUCT_IMAGES FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all sales" ON SALES FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all sales" ON SALES FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
  CREATE POLICY "Admins can view all environment invites" ON ENVIRONMENT_INVITES FOR
  SELECT
    USING (EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
    ));
  CREATE POLICY "Admins can manage all environment invites" ON ENVIRONMENT_INVITES FOR ALL USING (EXISTS (
    SELECT
      1
    FROM
      MEMBERSHIPS M
    WHERE
      M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
  ));
 
  -- Step 10: Update indexes to use new role names
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK;
  DROP INDEX IF EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN;
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_ADMIN_CHECK ON MEMBERSHIPS(USER_ID, ROLE) WHERE ROLE = 'admin';
  CREATE INDEX IF NOT EXISTS IDX_MEMBERSHIPS_SYSTEM_ADMIN ON MEMBERSHIPS(USER_ID, ROLE) WHERE ENVIRONMENT_ID IS NULL AND ROLE = 'admin';
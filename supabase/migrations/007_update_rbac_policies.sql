-- Migration to update RLS policies with proper RBAC and APPLIED TO clauses
-- This migration implements the following access control:
-- 1. admin and grady_staff: Full access to everything (create, read, update, delete)
-- 2. Authenticated users: Limited access (login and view only)
-- 3. All policies have proper APPLIED TO clauses

-- Drop all existing policies to recreate them with proper structure
DROP POLICY IF EXISTS "Users can view own profile" ON PROFILES;

DROP POLICY IF EXISTS "Admins can view all profiles" ON PROFILES;

DROP POLICY IF EXISTS "Members can view their environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "Admins can view all environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "Users can create environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "Users can update their environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "Admins can update any environment" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can create environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can update environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "System admins can delete environments" ON ENVIRONMENTS;

DROP POLICY IF EXISTS "Users can view memberships in their environments" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Users can create memberships in their environments" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Users can create their own memberships" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "System admins can manage all memberships" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Members can view products in their environments" ON PRODUCTS;

DROP POLICY IF EXISTS "Staff can modify products" ON PRODUCTS;

DROP POLICY IF EXISTS "System admins can manage all products" ON PRODUCTS;

DROP POLICY IF EXISTS "Members can view locations in their environments" ON LOCATIONS;

DROP POLICY IF EXISTS "Staff can modify locations" ON LOCATIONS;

DROP POLICY IF EXISTS "System admins can manage all locations" ON LOCATIONS;

DROP POLICY IF EXISTS "Members can view product status history in their environments" ON PRODUCT_STATUS_HISTORY;

DROP POLICY IF EXISTS "Staff can create product status history" ON PRODUCT_STATUS_HISTORY;

DROP POLICY IF EXISTS "Members can view product comments in their environments" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Members can create product comments" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Users can update their own comments" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Staff can update any comment" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Users can delete their own comments" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Staff can delete any comment" ON PRODUCT_COMMENTS;

DROP POLICY IF EXISTS "Members can view product images in their environments" ON PRODUCT_IMAGES;

DROP POLICY IF EXISTS "Members can create product images" ON PRODUCT_IMAGES;

DROP POLICY IF EXISTS "Users can delete their own images" ON PRODUCT_IMAGES;

DROP POLICY IF EXISTS "Staff can delete any image" ON PRODUCT_IMAGES;

DROP POLICY IF EXISTS "Members can view sales in their environments" ON SALES;

DROP POLICY IF EXISTS "Staff can create sales records" ON SALES;

DROP POLICY IF EXISTS "Staff can update sales records" ON SALES;

DROP POLICY IF EXISTS "Staff can delete sales records" ON SALES;

DROP POLICY IF EXISTS "Members can view invites for their environments" ON ENVIRONMENT_INVITES;

DROP POLICY IF EXISTS "Users can view invites sent to their email" ON ENVIRONMENT_INVITES;

DROP POLICY IF EXISTS "Staff can create environment invites" ON ENVIRONMENT_INVITES;

DROP POLICY IF EXISTS "Staff can update environment invites" ON ENVIRONMENT_INVITES;

DROP POLICY IF EXISTS "Staff can delete environment invites" ON ENVIRONMENT_INVITES;

DROP POLICY IF EXISTS "System admins can manage all invites" ON ENVIRONMENT_INVITES;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON PROFILES
  FOR SELECT
  TO AUTHENTICATED
  USING (AUTH.UID() = ID);

-- admin and grady_staff can view all profiles
CREATE POLICY "Admins can view all profiles" ON PROFILES
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON PROFILES
  FOR UPDATE
  TO AUTHENTICATED
  USING (AUTH.UID() = ID)
  WITH CHECK (AUTH.UID() = ID);

-- admin and grady_staff can update any profile
CREATE POLICY "Admins can update any profile" ON PROFILES
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- ENVIRONMENTS TABLE POLICIES
-- ============================================================================

-- Users can view environments they are members of
CREATE POLICY "Members can view their environments" ON ENVIRONMENTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    MEMBERSHIPS M
     WHERE
                    M.ENVIRONMENT_ID = ENVIRONMENTS.ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all environments
CREATE POLICY "Admins can view all environments" ON ENVIRONMENTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create environments
CREATE POLICY "Admins can create environments" ON ENVIRONMENTS
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
)
  );

-- admin and grady_staff can update any environment
CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any environment
CREATE POLICY "Admins can delete any environment" ON ENVIRONMENTS
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- MEMBERSHIPS TABLE POLICIES
-- ============================================================================

-- Users can view memberships in environments they belong to
CREATE POLICY "Members can view memberships in their environments" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    MEMBERSHIPS M
     WHERE
                    M.ENVIRONMENT_ID = MEMBERSHIPS.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all memberships
CREATE POLICY "Admins can view all memberships" ON MEMBERSHIPS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create memberships
CREATE POLICY "Admins can create memberships" ON MEMBERSHIPS
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
)
  );

-- admin and grady_staff can update any membership
CREATE POLICY "Admins can update any membership" ON MEMBERSHIPS
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any membership
CREATE POLICY "Admins can delete any membership" ON MEMBERSHIPS
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- LOCATIONS TABLE POLICIES
-- ============================================================================

-- Users can view locations in environments they belong to
CREATE POLICY "Members can view locations in their environments" ON LOCATIONS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can view all locations
CREATE POLICY "Admins can view all locations" ON LOCATIONS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create locations
CREATE POLICY "Admins can create locations" ON LOCATIONS
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
)
  );

-- admin and grady_staff can update any location
CREATE POLICY "Admins can update any location" ON LOCATIONS
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any location
CREATE POLICY "Admins can delete any location" ON LOCATIONS
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Users can view products in environments they belong to
CREATE POLICY "Members can view products in their environments" ON PRODUCTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    MEMBERSHIPS M
     WHERE
                    M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all products
CREATE POLICY "Admins can view all products" ON PRODUCTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create products
CREATE POLICY "Admins can create products" ON PRODUCTS
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
)
  );

-- admin and grady_staff can update any product
CREATE POLICY "Admins can update any product" ON PRODUCTS
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any product
CREATE POLICY "Admins can delete any product" ON PRODUCTS
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- PRODUCT_STATUS_HISTORY TABLE POLICIES
-- ============================================================================

-- Users can view product status history in environments they belong to
CREATE POLICY "Members can view product status history in their environments" ON PRODUCT_STATUS_HISTORY
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
     WHERE
                    P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all product status history
CREATE POLICY "Admins can view all product status history" ON PRODUCT_STATUS_HISTORY
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create product status history
CREATE POLICY "Admins can create product status history" ON PRODUCT_STATUS_HISTORY
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
)
  );

-- admin and grady_staff can update any product status history
CREATE POLICY "Admins can update any product status history" ON PRODUCT_STATUS_HISTORY
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any product status history
CREATE POLICY "Admins can delete any product status history" ON PRODUCT_STATUS_HISTORY
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- PRODUCT_COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view product comments in environments they belong to
CREATE POLICY "Members can view product comments in their environments" ON PRODUCT_COMMENTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
     WHERE
                    P.ID = PRODUCT_COMMENTS.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all product comments
CREATE POLICY "Admins can view all product comments" ON PRODUCT_COMMENTS
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create product comments
CREATE POLICY "Admins can create product comments" ON PRODUCT_COMMENTS
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
)
  );

-- admin and grady_staff can update any product comment
CREATE POLICY "Admins can update any product comment" ON PRODUCT_COMMENTS
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any product comment
CREATE POLICY "Admins can delete any product comment" ON PRODUCT_COMMENTS
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- PRODUCT_IMAGES TABLE POLICIES
-- ============================================================================

-- Users can view product images in environments they belong to
CREATE POLICY "Members can view product images in their environments" ON PRODUCT_IMAGES
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
     WHERE
                    P.ID = PRODUCT_IMAGES.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all product images
CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create product images
CREATE POLICY "Admins can create product images" ON PRODUCT_IMAGES
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
)
  );

-- admin and grady_staff can update any product image
CREATE POLICY "Admins can update any product image" ON PRODUCT_IMAGES
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any product image
CREATE POLICY "Admins can delete any product image" ON PRODUCT_IMAGES
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- SALES TABLE POLICIES
-- ============================================================================

-- Users can view sales in environments they belong to
CREATE POLICY "Members can view sales in their environments" ON SALES
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
     WHERE
                    P.ID = SALES.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all sales
CREATE POLICY "Admins can view all sales" ON SALES
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create sales records
CREATE POLICY "Admins can create sales records" ON SALES
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
)
  );

-- admin and grady_staff can update any sales record
CREATE POLICY "Admins can update any sales record" ON SALES
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any sales record
CREATE POLICY "Admins can delete any sales record" ON SALES
  FOR DELETE
  TO AUTHENTICATED
  USING (
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

-- ============================================================================
-- ENVIRONMENT_INVITES TABLE POLICIES
-- ============================================================================

-- Users can view invites for environments they belong to
CREATE POLICY "Members can view invites for their environments" ON ENVIRONMENT_INVITES
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EXISTS (
     SELECT
                    1
     FROM
                    MEMBERSHIPS M
     WHERE
                    M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
)
  );

-- Users can view invites sent to their email
CREATE POLICY "Users can view invites sent to their email" ON ENVIRONMENT_INVITES
  FOR SELECT
  TO AUTHENTICATED
  USING (
    EMAIL = (
     SELECT
                    EMAIL
     FROM
                    PROFILES
     WHERE
                    ID = AUTH.UID()
)
  );

-- admin and grady_staff can view all invites
CREATE POLICY "Admins can view all invites" ON ENVIRONMENT_INVITES
  FOR SELECT
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can create invites
CREATE POLICY "Admins can create invites" ON ENVIRONMENT_INVITES
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
)
  );

-- admin and grady_staff can update any invite
CREATE POLICY "Admins can update any invite" ON ENVIRONMENT_INVITES
  FOR UPDATE
  TO AUTHENTICATED
  USING (
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

-- admin and grady_staff can delete any invite
CREATE POLICY "Admins can delete any invite" ON ENVIRONMENT_INVITES
  FOR DELETE
  TO AUTHENTICATED
  USING (
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
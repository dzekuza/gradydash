-- Fix storage bucket policies to use PARTNER_ID instead of ENVIRONMENT_ID
-- This migration updates the storage policies created in migration 002 to work with the renamed tables

-- Drop old storage policies that reference ENVIRONMENT_ID
DROP POLICY IF EXISTS "Users can view product images in their environments" ON STORAGE.OBJECTS;
DROP POLICY IF EXISTS "Users can upload product images in their environments" ON STORAGE.OBJECTS;
DROP POLICY IF EXISTS "Users can update product images in their environments" ON STORAGE.OBJECTS;
DROP POLICY IF EXISTS "Users can delete product images in their environments" ON STORAGE.OBJECTS;
DROP POLICY IF EXISTS "Admins can view all product images" ON STORAGE.OBJECTS;
DROP POLICY IF EXISTS "Admins can manage all product images" ON STORAGE.OBJECTS;

-- Create new storage policies with updated table and column references
-- Users can view images for products in their partners
CREATE POLICY "Users can view product images in their partners" ON STORAGE.OBJECTS FOR SELECT USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM PRODUCTS P
      JOIN MEMBERSHIPS M ON P.PARTNER_ID = M.PARTNER_ID
      WHERE M.USER_ID = AUTH.UID()
      AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    )
  )
);

-- Users can upload images for products in their partners
CREATE POLICY "Users can upload product images in their partners" ON STORAGE.OBJECTS FOR INSERT WITH CHECK (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM PRODUCTS P
      JOIN MEMBERSHIPS M ON P.PARTNER_ID = M.PARTNER_ID
      WHERE M.USER_ID = AUTH.UID()
      AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    )
  )
);

-- Users can update images for products in their partners
CREATE POLICY "Users can update product images in their partners" ON STORAGE.OBJECTS FOR UPDATE USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM PRODUCTS P
      JOIN MEMBERSHIPS M ON P.PARTNER_ID = M.PARTNER_ID
      WHERE M.USER_ID = AUTH.UID()
      AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    )
  )
);

-- Users can delete images for products in their partners
CREATE POLICY "Users can delete product images in their partners" ON STORAGE.OBJECTS FOR DELETE USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM PRODUCTS P
      JOIN MEMBERSHIPS M ON P.PARTNER_ID = M.PARTNER_ID
      WHERE M.USER_ID = AUTH.UID()
      AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
    )
  )
);

-- Admins can view all product images
CREATE POLICY "Admins can view all product images" ON STORAGE.OBJECTS FOR SELECT USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM MEMBERSHIPS M
      WHERE M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
    )
  )
);

-- Admins can manage all product images
CREATE POLICY "Admins can manage all product images" ON STORAGE.OBJECTS FOR ALL USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
      SELECT 1
      FROM MEMBERSHIPS M
      WHERE M.USER_ID = AUTH.UID()
      AND M.ROLE = 'admin'
    )
  )
);

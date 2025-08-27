-- Fix RLS policies for product_images table
-- Allow users to manage images for products in their environments

-- Drop the overly restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can manage all product images" ON PRODUCT_IMAGES;

-- Create new policies that allow users to manage images for products in their environments
CREATE POLICY "Users can view product images in their environments" ON PRODUCT_IMAGES FOR SELECT USING (
  EXISTS (
    SELECT
         1
    FROM
         PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
         M.USER_ID = AUTH.UID()
        AND P.ID = PRODUCT_IMAGES.PRODUCT_ID
)
);

CREATE POLICY "Users can create product images in their environments" ON PRODUCT_IMAGES FOR INSERT WITH CHECK (
  EXISTS (
    SELECT
         1
    FROM
         PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
         M.USER_ID = AUTH.UID()
        AND P.ID = PRODUCT_IMAGES.PRODUCT_ID
)
);

CREATE POLICY "Users can update product images in their environments" ON PRODUCT_IMAGES FOR UPDATE USING (
  EXISTS (
    SELECT
         1
    FROM
         PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
         M.USER_ID = AUTH.UID()
        AND P.ID = PRODUCT_IMAGES.PRODUCT_ID
)
);

CREATE POLICY "Users can delete product images in their environments" ON PRODUCT_IMAGES FOR DELETE USING (
  EXISTS (
    SELECT
         1
    FROM
         PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
         M.USER_ID = AUTH.UID()
        AND P.ID = PRODUCT_IMAGES.PRODUCT_ID
)
);

-- Keep the admin policy for viewing all product images
CREATE POLICY "Admins can view all product images" ON PRODUCT_IMAGES FOR SELECT USING (
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
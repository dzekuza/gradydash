-- Fix RLS policies for products to allow regular users to create products in their environments

-- Drop the overly restrictive admin-only policies
DROP POLICY IF EXISTS "Admins can manage all products" ON PRODUCTS;

-- Create new policies that allow users to manage products in their environments
CREATE POLICY "Users can view products in their environments" ON PRODUCTS FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM MEMBERSHIPS M 
    WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID 
    AND M.USER_ID = AUTH.UID()
  )
);

CREATE POLICY "Users can create products in their environments" ON PRODUCTS FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM MEMBERSHIPS M 
    WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID 
    AND M.USER_ID = AUTH.UID()
  )
);

CREATE POLICY "Users can update products in their environments" ON PRODUCTS FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM MEMBERSHIPS M 
    WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID 
    AND M.USER_ID = AUTH.UID()
  )
);

CREATE POLICY "Users can delete products in their environments" ON PRODUCTS FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM MEMBERSHIPS M 
    WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID 
    AND M.USER_ID = AUTH.UID()
  )
);

-- Keep the admin policy for viewing all products
CREATE POLICY "Admins can view all products" ON PRODUCTS FOR SELECT USING (
  EXISTS ( 
    SELECT 1 FROM MEMBERSHIPS M 
    WHERE M.USER_ID = AUTH.UID() 
    AND M.ROLE = 'admin' 
  )
);

-- Migration to update RLS policies for multi-tenant access
-- Business owners and their invited partners can see each other's data within the same business

-- First, let's add a column to track which business a user belongs to
ALTER TABLE PROFILES
    ADD COLUMN IF NOT EXISTS BUSINESS_ID UUID
        REFERENCES PARTNERS(
            ID
        ) ON DELETE SET NULL;

-- Update existing profiles to set their business_id based on their primary_partner_id
UPDATE PROFILES
SET
    BUSINESS_ID = PRIMARY_PARTNER_ID
WHERE
    PRIMARY_PARTNER_ID IS NOT NULL;

-- For system admins, set business_id to NULL
UPDATE PROFILES
SET
    BUSINESS_ID = NULL
WHERE
    IS_PARTNER_ADMIN = FALSE
    AND PRIMARY_PARTNER_ID IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS IDX_PROFILES_BUSINESS_ID ON PROFILES(BUSINESS_ID);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own partner admin status" ON PROFILES;

DROP POLICY IF EXISTS "Users can update own partner admin status" ON PROFILES;

DROP POLICY IF EXISTS "Users can create partners" ON PARTNERS;

DROP POLICY IF EXISTS "Partner admins can update their own partners" ON PARTNERS;

DROP POLICY IF EXISTS "System admins can update any partner" ON PARTNERS;

DROP POLICY IF EXISTS "Partner admins can create memberships in their partners" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Partner admins can update memberships in their partners" ON MEMBERSHIPS;

DROP POLICY IF EXISTS "Partner admins can delete memberships in their partners" ON MEMBERSHIPS;

-- Create new RLS policies for multi-tenant access

-- PROFILES policies
-- Users can view their own profile and profiles of users in the same business
CREATE POLICY "Users can view profiles in same business" ON PROFILES FOR SELECT
USING (
  AUTH.UID() = ID OR
  BUSINESS_ID = (
    SELECT
                           BUSINESS_ID
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
) OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON PROFILES FOR UPDATE
USING (AUTH.UID() = ID);

-- PARTNERS policies
-- Users can view their own partner and partners they have access to
CREATE POLICY "Users can view accessible partners" ON PARTNERS FOR SELECT
USING (
  CREATED_BY = AUTH.UID() OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND PARTNER_ID = PARTNERS.ID
) OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Business owners can create partners (for their business)
CREATE POLICY "Business owners can create partners" ON PARTNERS FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND IS_PARTNER_ADMIN = TRUE
)
);

-- Business owners can update their own partners
CREATE POLICY "Business owners can update own partners" ON PARTNERS FOR UPDATE
USING (
  CREATED_BY = AUTH.UID() OR
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND IS_PARTNER_ADMIN = TRUE
        AND PRIMARY_PARTNER_ID = PARTNERS.ID
)
);

-- System admins can update any partner
CREATE POLICY "System admins can update any partner" ON PARTNERS FOR UPDATE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- MEMBERSHIPS policies
-- Users can view memberships in their business
CREATE POLICY "Users can view memberships in business" ON MEMBERSHIPS FOR SELECT
USING (
  USER_ID = AUTH.UID() OR
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P2.ID = MEMBERSHIPS.USER_ID
) OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Business owners can create memberships in their business
CREATE POLICY "Business owners can create memberships" ON MEMBERSHIPS FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND IS_PARTNER_ADMIN = TRUE
        AND PRIMARY_PARTNER_ID = MEMBERSHIPS.PARTNER_ID
)
);

-- Business owners can update memberships in their business
CREATE POLICY "Business owners can update memberships" ON MEMBERSHIPS FOR UPDATE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND IS_PARTNER_ADMIN = TRUE
        AND PRIMARY_PARTNER_ID = MEMBERSHIPS.PARTNER_ID
)
);

-- Business owners can delete memberships in their business
CREATE POLICY "Business owners can delete memberships" ON MEMBERSHIPS FOR DELETE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND IS_PARTNER_ADMIN = TRUE
        AND PRIMARY_PARTNER_ID = MEMBERSHIPS.PARTNER_ID
)
);

-- PRODUCTS policies
-- Users can view products in their business
CREATE POLICY "Users can view products in business" ON PRODUCTS FOR SELECT
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P2.ID = PRODUCTS.CREATED_BY
) OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Users can create products in their business
CREATE POLICY "Users can create products in business" ON PRODUCTS FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND BUSINESS_ID IS NOT NULL
)
);

-- Users can update products in their business
CREATE POLICY "Users can update products in business" ON PRODUCTS FOR UPDATE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P2.ID = PRODUCTS.CREATED_BY
)
);

-- Users can delete products in their business
CREATE POLICY "Users can delete products in business" ON PRODUCTS FOR DELETE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P2.ID = PRODUCTS.CREATED_BY
)
);

-- LOCATIONS policies
-- Users can view locations in their business
CREATE POLICY "Users can view locations in business" ON LOCATIONS FOR SELECT
USING (
  EXISTS (
    SELECT
                  1
    FROM
                  PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN MEMBERSHIPS M
        ON M.USER_ID = P2.ID
    WHERE
                  P1.ID = AUTH.UID()
        AND M.PARTNER_ID = LOCATIONS.PARTNER_ID
) OR
  EXISTS (
    SELECT
                  1
    FROM
                  MEMBERSHIPS
    WHERE
                  USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Users can create locations in their business
CREATE POLICY "Users can create locations in business" ON LOCATIONS FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT
                  1
    FROM
                  PROFILES
    WHERE
                  ID = AUTH.UID()
        AND BUSINESS_ID IS NOT NULL
)
);

-- Users can update locations in their business
CREATE POLICY "Users can update locations in business" ON LOCATIONS FOR UPDATE
USING (
  EXISTS (
    SELECT
                  1
    FROM
                  PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN MEMBERSHIPS M
        ON M.USER_ID = P2.ID
    WHERE
                  P1.ID = AUTH.UID()
        AND M.PARTNER_ID = LOCATIONS.PARTNER_ID
)
);

-- Users can delete locations in their business
CREATE POLICY "Users can delete locations in business" ON LOCATIONS FOR DELETE
USING (
  EXISTS (
    SELECT
                  1
    FROM
                  PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN MEMBERSHIPS M
        ON M.USER_ID = P2.ID
    WHERE
                  P1.ID = AUTH.UID()
        AND M.PARTNER_ID = LOCATIONS.PARTNER_ID
)
);

-- SALES policies
-- Users can view sales in their business
CREATE POLICY "Users can view sales in business" ON SALES FOR SELECT
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN PRODUCTS P
        ON P.CREATED_BY = P2.ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P.ID = SALES.PRODUCT_ID
) OR
  EXISTS (
    SELECT
                           1
    FROM
                           MEMBERSHIPS
    WHERE
                           USER_ID = AUTH.UID()
        AND ROLE = 'admin'
        AND PARTNER_ID IS NULL
)
);

-- Users can create sales in their business
CREATE POLICY "Users can create sales in business" ON SALES FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES
    WHERE
                           ID = AUTH.UID()
        AND BUSINESS_ID IS NOT NULL
)
);

-- Users can update sales in their business
CREATE POLICY "Users can update sales in business" ON SALES FOR UPDATE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN PRODUCTS P
        ON P.CREATED_BY = P2.ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P.ID = SALES.PRODUCT_ID
)
);

-- Users can delete sales in their business
CREATE POLICY "Users can delete sales in business" ON SALES FOR DELETE
USING (
  EXISTS (
    SELECT
                           1
    FROM
                           PROFILES P1
        JOIN PROFILES P2
        ON P1.BUSINESS_ID = P2.BUSINESS_ID
        JOIN PRODUCTS P
        ON P.CREATED_BY = P2.ID
    WHERE
                           P1.ID = AUTH.UID()
        AND P.ID = SALES.PRODUCT_ID
)
);

-- Add comments for documentation
COMMENT ON COLUMN PROFILES.BUSINESS_ID IS 'The business (partner) that this user belongs to. NULL for system admins.';
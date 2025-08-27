-- Create storage bucket for product images
INSERT INTO STORAGE.BUCKETS (
    ID,
    NAME,
    PUBLIC,
    FILE_SIZE_LIMIT,
    ALLOWED_MIME_TYPES
) VALUES (
    'product-images',
    'product-images',
    TRUE,
    5242880, -- 5MB limit
    ARRAY['image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp']
) ON CONFLICT (
    ID
) DO NOTHING;

-- Create RLS policies for product images storage
-- Users can view images for products in their environments
CREATE POLICY "Users can view product images in their environments" ON STORAGE.OBJECTS FOR SELECT USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
                  M.USER_ID = AUTH.UID()
        AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
  )
);

-- Users can upload images for products in their environments
CREATE POLICY "Users can upload product images in their environments" ON STORAGE.OBJECTS FOR INSERT WITH CHECK (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
                  M.USER_ID = AUTH.UID()
        AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
  )
);

-- Users can update images for products in their environments
CREATE POLICY "Users can update product images in their environments" ON STORAGE.OBJECTS FOR UPDATE USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
                  M.USER_ID = AUTH.UID()
        AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
  )
);

-- Users can delete images for products in their environments
CREATE POLICY "Users can delete product images in their environments" ON STORAGE.OBJECTS FOR DELETE USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  PRODUCTS P
        JOIN MEMBERSHIPS M
        ON P.ENVIRONMENT_ID = M.ENVIRONMENT_ID
    WHERE
                  M.USER_ID = AUTH.UID()
        AND P.ID::TEXT = (STORAGE.FOLDERNAME(NAME))[1]
)
  )
);

-- Admins can view all product images
CREATE POLICY "Admins can view all product images" ON STORAGE.OBJECTS FOR SELECT USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  MEMBERSHIPS M
    WHERE
                  M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
)
  )
);

-- Admins can manage all product images
CREATE POLICY "Admins can manage all product images" ON STORAGE.OBJECTS FOR ALL USING (
  BUCKET_ID = 'product-images' AND (
    EXISTS (
    SELECT
                  1
    FROM
                  MEMBERSHIPS M
    WHERE
                  M.USER_ID = AUTH.UID()
        AND M.ROLE = 'admin'
)
  )
);
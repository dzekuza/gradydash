-- Migration to sync schema fields with requirements
-- This migration adds missing fields and renames fields to match the target schema

-- ============================================================================
-- ENVIRONMENT_INVITES TABLE UPDATES
-- ============================================================================

-- Add missing token field to environment_invites
ALTER TABLE ENVIRONMENT_INVITES 
ADD COLUMN IF NOT EXISTS TOKEN TEXT UNIQUE;

-- Add comment for documentation
COMMENT ON COLUMN ENVIRONMENT_INVITES.TOKEN IS 'Unique token for invitation acceptance';

-- ============================================================================
-- PRODUCT_IMAGES TABLE UPDATES
-- ============================================================================

-- Check if storage_path exists and rename to file_path
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_images' AND column_name = 'storage_path') THEN
        ALTER TABLE PRODUCT_IMAGES RENAME COLUMN STORAGE_PATH TO FILE_PATH;
    END IF;
END $$;

-- Make file_size nullable
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_images' AND column_name = 'file_size' AND is_nullable = 'NO') THEN
        ALTER TABLE PRODUCT_IMAGES ALTER COLUMN FILE_SIZE DROP NOT NULL;
    END IF;
END $$;

-- Remove mime_type column
ALTER TABLE PRODUCT_IMAGES 
DROP COLUMN IF EXISTS MIME_TYPE;

-- ============================================================================
-- PRODUCT_STATUS_HISTORY TABLE UPDATES
-- ============================================================================

-- Rename note to notes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_status_history' AND column_name = 'note') THEN
        ALTER TABLE PRODUCT_STATUS_HISTORY RENAME COLUMN NOTE TO NOTES;
    END IF;
END $$;

-- ============================================================================
-- SALES TABLE UPDATES
-- ============================================================================

-- Rename amount to sale_price
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'amount') THEN
        ALTER TABLE SALES RENAME COLUMN AMOUNT TO SALE_PRICE;
    END IF;
END $$;

-- Rename sold_at to sale_date
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'sold_at') THEN
        ALTER TABLE SALES RENAME COLUMN SOLD_AT TO SALE_DATE;
    END IF;
END $$;

-- Remove currency column
ALTER TABLE SALES 
DROP COLUMN IF EXISTS CURRENCY;

-- Add notes field
ALTER TABLE SALES 
ADD COLUMN IF NOT EXISTS NOTES TEXT;

-- ============================================================================
-- PRODUCTS TABLE UPDATES
-- ============================================================================

-- Add missing fields
ALTER TABLE PRODUCTS 
ADD COLUMN IF NOT EXISTS NOTES TEXT;

ALTER TABLE PRODUCTS 
ADD COLUMN IF NOT EXISTS CREATED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS IDX_PRODUCTS_CREATED_BY ON PRODUCTS(CREATED_BY);
CREATE INDEX IF NOT EXISTS IDX_ENVIRONMENT_INVITES_TOKEN ON ENVIRONMENT_INVITES(TOKEN);
CREATE INDEX IF NOT EXISTS IDX_SALES_SALE_DATE ON SALES(SALE_DATE);

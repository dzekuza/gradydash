-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE ROLE AS
  ENUM ('admin', 'store_manager');
  CREATE TYPE PRODUCT_STATUS AS
    ENUM ('taken', 'in_repair', 'selling', 'sold', 'returned', 'discarded');
 
    -- Create profiles table
    CREATE TABLE PROFILES ( ID UUID REFERENCES AUTH.USERS(ID) ON DELETE CASCADE PRIMARY KEY, EMAIL TEXT UNIQUE NOT NULL, FULL_NAME TEXT, AVATAR_URL TEXT, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create environments table
    CREATE TABLE ENVIRONMENTS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, NAME TEXT NOT NULL, SLUG TEXT UNIQUE NOT NULL, DESCRIPTION TEXT, CREATED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create memberships table
    CREATE TABLE MEMBERSHIPS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, ENVIRONMENT_ID UUID REFERENCES ENVIRONMENTS(ID) ON DELETE CASCADE, USER_ID UUID REFERENCES PROFILES(ID) ON DELETE CASCADE, ROLE ROLE NOT NULL DEFAULT 'store_manager', CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UNIQUE(ENVIRONMENT_ID, USER_ID) );
 
    -- Create locations table
    CREATE TABLE LOCATIONS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, ENVIRONMENT_ID UUID REFERENCES ENVIRONMENTS(ID) ON DELETE CASCADE, NAME TEXT NOT NULL, DESCRIPTION TEXT, ADDRESS TEXT, CONTACT_PERSON_NAME TEXT, CONTACT_EMAIL TEXT, CONTACT_PHONE TEXT, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create products table
    CREATE TABLE PRODUCTS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, ENVIRONMENT_ID UUID REFERENCES ENVIRONMENTS(ID) ON DELETE CASCADE, TITLE TEXT NOT NULL, SKU TEXT, BARCODE TEXT, DESCRIPTION TEXT, STATUS PRODUCT_STATUS NOT NULL DEFAULT 'taken', LOCATION_ID UUID REFERENCES LOCATIONS(ID) ON DELETE SET NULL, PURCHASE_PRICE DECIMAL(10, 2), SELLING_PRICE DECIMAL(10, 2), SOLD_PRICE DECIMAL(10, 2), SOLD_AT TIMESTAMP WITH TIME ZONE, STATUS_UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 -- CSV import fields
    EXTERNAL_ID TEXT, PRODUCT_TYPE TEXT, GTIN TEXT, UPC TEXT, EAN TEXT, ISBN TEXT, SHORT_DESCRIPTION TEXT, CATEGORIES TEXT[], TAGS TEXT[], NOTES TEXT, CREATED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL );
 
    -- Create product_status_history table
    CREATE TABLE PRODUCT_STATUS_HISTORY ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, PRODUCT_ID UUID REFERENCES PRODUCTS(ID) ON DELETE CASCADE, FROM_STATUS PRODUCT_STATUS NOT NULL, TO_STATUS PRODUCT_STATUS NOT NULL, NOTES TEXT, CHANGED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create product_comments table
    CREATE TABLE PRODUCT_COMMENTS ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, PRODUCT_ID UUID REFERENCES PRODUCTS(ID) ON DELETE CASCADE, USER_ID UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, CONTENT TEXT NOT NULL, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(), UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create product_images table
    CREATE TABLE PRODUCT_IMAGES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, PRODUCT_ID UUID REFERENCES PRODUCTS(ID) ON DELETE CASCADE, FILE_PATH TEXT NOT NULL, FILE_NAME TEXT NOT NULL, FILE_SIZE INTEGER, UPLOADED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create sales table
    CREATE TABLE SALES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, PRODUCT_ID UUID REFERENCES PRODUCTS(ID) ON DELETE CASCADE, SALE_PRICE DECIMAL(10, 2) NOT NULL, SALE_DATE TIMESTAMP WITH TIME ZONE DEFAULT NOW(), SOLD_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, NOTES TEXT, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create environment_invites table
    CREATE TABLE ENVIRONMENT_INVITES ( ID UUID DEFAULT UUID_GENERATE_V4() PRIMARY KEY, ENVIRONMENT_ID UUID REFERENCES ENVIRONMENTS(ID) ON DELETE CASCADE, EMAIL TEXT NOT NULL, ROLE ROLE NOT NULL, TOKEN TEXT UNIQUE, INVITED_BY UUID REFERENCES PROFILES(ID) ON DELETE SET NULL, ACCEPTED_AT TIMESTAMP WITH TIME ZONE, EXPIRES_AT TIMESTAMP WITH TIME ZONE NOT NULL, CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
 
    -- Create indexes for better performance
    CREATE INDEX IDX_PRODUCTS_ENVIRONMENT_ID ON PRODUCTS(ENVIRONMENT_ID);
    CREATE INDEX IDX_PRODUCTS_STATUS ON PRODUCTS(STATUS);
    CREATE INDEX IDX_PRODUCTS_LOCATION_ID ON PRODUCTS(LOCATION_ID);
    CREATE INDEX IDX_PRODUCTS_CREATED_BY ON PRODUCTS(CREATED_BY);
    CREATE INDEX IDX_PRODUCTS_EXTERNAL_ID ON PRODUCTS(EXTERNAL_ID);
    CREATE INDEX IDX_PRODUCTS_PRODUCT_TYPE ON PRODUCTS(PRODUCT_TYPE);
    CREATE INDEX IDX_PRODUCTS_GTIN ON PRODUCTS(GTIN);
    CREATE INDEX IDX_PRODUCTS_UPC ON PRODUCTS(UPC);
    CREATE INDEX IDX_PRODUCTS_EAN ON PRODUCTS(EAN);
    CREATE INDEX IDX_PRODUCTS_ISBN ON PRODUCTS(ISBN);
    CREATE INDEX IDX_MEMBERSHIPS_ENVIRONMENT_ID ON MEMBERSHIPS(ENVIRONMENT_ID);
    CREATE INDEX IDX_MEMBERSHIPS_USER_ID ON MEMBERSHIPS(USER_ID);
    CREATE INDEX IDX_PRODUCT_STATUS_HISTORY_PRODUCT_ID ON PRODUCT_STATUS_HISTORY(PRODUCT_ID);
    CREATE INDEX IDX_PRODUCT_COMMENTS_PRODUCT_ID ON PRODUCT_COMMENTS(PRODUCT_ID);
    CREATE INDEX IDX_PRODUCT_IMAGES_PRODUCT_ID ON PRODUCT_IMAGES(PRODUCT_ID);
    CREATE INDEX IDX_SALES_PRODUCT_ID ON SALES(PRODUCT_ID);
    CREATE INDEX IDX_SALES_SALE_DATE ON SALES(SALE_DATE);
    CREATE INDEX IDX_ENVIRONMENT_INVITES_ENVIRONMENT_ID ON ENVIRONMENT_INVITES(ENVIRONMENT_ID);
    CREATE INDEX IDX_ENVIRONMENT_INVITES_EMAIL ON ENVIRONMENT_INVITES(EMAIL);
    CREATE INDEX IDX_ENVIRONMENT_INVITES_TOKEN ON ENVIRONMENT_INVITES(TOKEN);
    CREATE INDEX IDX_PROFILES_EMAIL ON PROFILES(EMAIL);
    CREATE INDEX IDX_PROFILES_ID ON PROFILES(ID);
 
    -- Enable Row Level Security
    ALTER TABLE PROFILES ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ENVIRONMENTS ENABLE ROW LEVEL SECURITY;
    ALTER TABLE MEMBERSHIPS ENABLE ROW LEVEL SECURITY;
    ALTER TABLE LOCATIONS ENABLE ROW LEVEL SECURITY;
    ALTER TABLE PRODUCTS ENABLE ROW LEVEL SECURITY;
    ALTER TABLE PRODUCT_STATUS_HISTORY ENABLE ROW LEVEL SECURITY;
    ALTER TABLE PRODUCT_COMMENTS ENABLE ROW LEVEL SECURITY;
    ALTER TABLE PRODUCT_IMAGES ENABLE ROW LEVEL SECURITY;
    ALTER TABLE SALES ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ENVIRONMENT_INVITES ENABLE ROW LEVEL SECURITY;
 
    -- Create RLS policies
    -- Profiles: Users can read their own profile, admins can read all
    CREATE POLICY "Users can view own profile" ON PROFILES FOR
    SELECT
      USING (AUTH.UID() = ID);
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
 
    -- Environments: Members can read their environments, admins can read all
    CREATE POLICY "Members can view their environments" ON ENVIRONMENTS FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          MEMBERSHIPS M
        WHERE
          M.ENVIRONMENT_ID = ENVIRONMENTS.ID
          AND M.USER_ID = AUTH.UID()
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
 
    -- Allow authenticated users to create environments
    CREATE POLICY "Users can create environments" ON ENVIRONMENTS FOR INSERT WITH CHECK (
      AUTH.UID() IS NOT NULL
    );
 
    -- Allow users to update environments they created
    CREATE POLICY "Users can update their environments" ON ENVIRONMENTS FOR
    UPDATE USING (
      CREATED_BY = AUTH.UID()
    );
 
    -- Allow admins to update any environment
    CREATE POLICY "Admins can update any environment" ON ENVIRONMENTS FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.USER_ID = AUTH.UID() AND M.ROLE = 'admin')
    );
 
    -- Memberships: Users can read memberships in their environments
    CREATE POLICY "Users can view memberships in their environments" ON MEMBERSHIPS FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          MEMBERSHIPS M
        WHERE
          M.ENVIRONMENT_ID = MEMBERSHIPS.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Allow users to create memberships in environments they created
    CREATE POLICY "Users can create memberships in their environments" ON MEMBERSHIPS FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM ENVIRONMENTS E WHERE E.ID = MEMBERSHIPS.ENVIRONMENT_ID AND E.CREATED_BY = AUTH.UID())
    );
 
    -- Allow users to create their own memberships (for self-joining)
    CREATE POLICY "Users can create their own memberships" ON MEMBERSHIPS FOR INSERT WITH CHECK (
      USER_ID = AUTH.UID()
    );
 
    -- Products: Members can read products in their environments
    CREATE POLICY "Members can view products in their environments" ON PRODUCTS FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          MEMBERSHIPS M
        WHERE
          M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Users can manage products in their environments
    CREATE POLICY "Users can create products in their environments" ON PRODUCTS FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can update products in their environments" ON PRODUCTS FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can delete products in their environments" ON PRODUCTS FOR
    DELETE USING ( EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.ENVIRONMENT_ID = PRODUCTS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
    ) );
 
    -- Admins can view all products
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
 
    -- Locations: Members can read locations in their environments
    CREATE POLICY "Members can view locations in their environments" ON LOCATIONS FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          MEMBERSHIPS M
        WHERE
          M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Users can manage locations in their environments
    CREATE POLICY "Users can create locations in their environments" ON LOCATIONS FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can update locations in their environments" ON LOCATIONS FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can delete locations in their environments" ON LOCATIONS FOR
    DELETE USING ( EXISTS (
      SELECT
        1
      FROM
        MEMBERSHIPS M
      WHERE
        M.ENVIRONMENT_ID = LOCATIONS.ENVIRONMENT_ID
        AND M.USER_ID = AUTH.UID()
    ) );
 
    -- Admins can view all locations
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
 
    -- Product Status History: Members can read history in their environments
    CREATE POLICY "Members can view product status history in their environments" ON PRODUCT_STATUS_HISTORY FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
        WHERE
          P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Staff and admins can create status history entries
    CREATE POLICY "Staff can create product status history" ON PRODUCT_STATUS_HISTORY FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_STATUS_HISTORY.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Product Comments: Members can read comments in their environments
    CREATE POLICY "Members can view product comments in their environments" ON PRODUCT_COMMENTS FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
        WHERE
          P.ID = PRODUCT_COMMENTS.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Members can create comments in their environments
    CREATE POLICY "Members can create product comments" ON PRODUCT_COMMENTS FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID())
    );
 
    -- Users can update their own comments
    CREATE POLICY "Users can update their own comments" ON PRODUCT_COMMENTS FOR
    UPDATE USING (
      USER_ID = AUTH.UID()
    );
 
    -- Staff and admins can update any comment
    CREATE POLICY "Staff can update any comment" ON PRODUCT_COMMENTS FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_COMMENTS.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Users can delete their own comments
    CREATE POLICY "Users can delete their own comments" ON PRODUCT_COMMENTS FOR
    DELETE USING (USER_ID = AUTH.UID());
 
    -- Staff and admins can delete any comment
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
 
    -- Product Images: Members can read images in their environments
    CREATE POLICY "Members can view product images in their environments" ON PRODUCT_IMAGES FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
        WHERE
          P.ID = PRODUCT_IMAGES.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Users can manage images for products in their environments
    CREATE POLICY "Users can create product images in their environments" ON PRODUCT_IMAGES FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_IMAGES.PRODUCT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can update product images in their environments" ON PRODUCT_IMAGES FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = PRODUCT_IMAGES.PRODUCT_ID AND M.USER_ID = AUTH.UID())
    );
    CREATE POLICY "Users can delete product images in their environments" ON PRODUCT_IMAGES FOR
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
    ) );
 
    -- Admins can view all product images
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
 
    -- Sales: Members can read sales in their environments
    CREATE POLICY "Members can view sales in their environments" ON SALES FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          PRODUCTS P
          JOIN MEMBERSHIPS M
          ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID
        WHERE
          P.ID = SALES.PRODUCT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Staff and admins can create sales records
    CREATE POLICY "Staff can create sales records" ON SALES FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Staff and admins can update sales records
    CREATE POLICY "Staff can update sales records" ON SALES FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM PRODUCTS P JOIN MEMBERSHIPS M ON M.ENVIRONMENT_ID = P.ENVIRONMENT_ID WHERE P.ID = SALES.PRODUCT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Staff and admins can delete sales records
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
 
    -- Environment Invites: Members can read invites for their environments
    CREATE POLICY "Members can view invites for their environments" ON ENVIRONMENT_INVITES FOR
    SELECT
      USING ( EXISTS (
        SELECT
          1
        FROM
          MEMBERSHIPS M
        WHERE
          M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID
          AND M.USER_ID = AUTH.UID()
      ) );
 
    -- Users can read invites sent to their email
    CREATE POLICY "Users can view invites sent to their email" ON ENVIRONMENT_INVITES FOR
    SELECT
      USING ( EMAIL = (
        SELECT
          EMAIL
        FROM
          PROFILES
        WHERE
          ID = AUTH.UID()
      ) );
 
    -- Staff and admins can create invites
    CREATE POLICY "Staff can create environment invites" ON ENVIRONMENT_INVITES FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Staff and admins can update invites
    CREATE POLICY "Staff can update environment invites" ON ENVIRONMENT_INVITES FOR
    UPDATE USING (
      EXISTS (SELECT 1 FROM MEMBERSHIPS M WHERE M.ENVIRONMENT_ID = ENVIRONMENT_INVITES.ENVIRONMENT_ID AND M.USER_ID = AUTH.UID() AND M.ROLE IN ('admin', 'store_manager'))
    );
 
    -- Staff and admins can delete invites
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
 
    -- Create functions for automatic timestamps
    CREATE OR REPLACE FUNCTION UPDATE_UPDATED_AT_COLUMN() RETURNS TRIGGER AS
      $$
      BEGIN
        NEW.UPDATED_AT = NOW();
        RETURN NEW;
      END;

      $$ LANGUAGE 'plpgsql';
 
      -- Create triggers for updated_at columns
      CREATE TRIGGER UPDATE_PROFILES_UPDATED_AT BEFORE
      UPDATE ON PROFILES FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
      CREATE TRIGGER UPDATE_ENVIRONMENTS_UPDATED_AT BEFORE
      UPDATE ON ENVIRONMENTS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
      CREATE TRIGGER UPDATE_MEMBERSHIPS_UPDATED_AT BEFORE
      UPDATE ON MEMBERSHIPS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
      CREATE TRIGGER UPDATE_LOCATIONS_UPDATED_AT BEFORE
      UPDATE ON LOCATIONS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
      CREATE TRIGGER UPDATE_PRODUCTS_UPDATED_AT BEFORE
      UPDATE ON PRODUCTS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
      CREATE TRIGGER UPDATE_PRODUCT_COMMENTS_UPDATED_AT BEFORE
      UPDATE ON PRODUCT_COMMENTS FOR EACH ROW EXECUTE FUNCTION UPDATE_UPDATED_AT_COLUMN(
      );
 
      -- Function to handle new user signup
      CREATE OR REPLACE FUNCTION HANDLE_NEW_USER() RETURNS TRIGGER AS
        $$
        BEGIN
          INSERT INTO PROFILES (
            ID,
            EMAIL,
            FULL_NAME,
            AVATAR_URL
          ) VALUES (
            NEW.ID,
            NEW.EMAIL,
            COALESCE(NEW.RAW_USER_META_DATA->>'full_name', NEW.EMAIL),
            NEW.RAW_USER_META_DATA->>'avatar_url'
          ) ON CONFLICT (
            ID
          ) DO UPDATE SET EMAIL = EXCLUDED.EMAIL, FULL_NAME = COALESCE(
            EXCLUDED.FULL_NAME,
            PROFILES.FULL_NAME
          ), AVATAR_URL = COALESCE(
            EXCLUDED.AVATAR_URL,
            PROFILES.AVATAR_URL
          ), UPDATED_AT = NOW(
          );
          RETURN NEW;
        END;

        $$ LANGUAGE PLPGSQL SECURITY DEFINER;
 
        -- Trigger for new user signup
        CREATE TRIGGER ON_AUTH_USER_CREATED AFTER INSERT ON AUTH.USERS FOR EACH ROW EXECUTE FUNCTION HANDLE_NEW_USER(
        );
 
        -- Add comments for documentation
        COMMENT ON COLUMN PRODUCTS.EXTERNAL_ID IS
          'External ID from CSV import';
          COMMENT ON COLUMN PRODUCTS.PRODUCT_TYPE IS
            'Product type/category from CSV import';
            COMMENT ON COLUMN PRODUCTS.GTIN IS
              'Global Trade Item Number';
              COMMENT ON COLUMN PRODUCTS.UPC IS
                'Universal Product Code';
                COMMENT ON COLUMN PRODUCTS.EAN IS
                  'European Article Number';
                  COMMENT ON COLUMN PRODUCTS.ISBN IS
                    'International Standard Book Number';
                    COMMENT ON COLUMN PRODUCTS.SHORT_DESCRIPTION IS
                      'Short description from CSV import';
                      COMMENT ON COLUMN PRODUCTS.CATEGORIES IS
                        'Array of product categories';
                        COMMENT ON COLUMN PRODUCTS.TAGS IS
                          'Array of product tags';
                          COMMENT ON COLUMN LOCATIONS.CONTACT_PERSON_NAME IS
                            'Full name of the primary contact person for this location';
                            COMMENT ON COLUMN LOCATIONS.CONTACT_EMAIL IS
                              'Email address for contacting this location';
                              COMMENT ON COLUMN LOCATIONS.CONTACT_PHONE IS
                                'Phone number for contacting this location';
                                COMMENT ON COLUMN ENVIRONMENT_INVITES.TOKEN IS
                                  'Unique token for invitation acceptance';
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE role AS ENUM ('grady_admin', 'grady_staff', 'reseller_manager', 'reseller_staff');
CREATE TYPE product_status AS ENUM ('taken', 'in_repair', 'selling', 'sold', 'returned', 'discarded');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create environments table
CREATE TABLE environments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memberships table
CREATE TABLE memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role role NOT NULL DEFAULT 'reseller_staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(environment_id, user_id)
);

-- Create locations table
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  description TEXT,
  status product_status NOT NULL DEFAULT 'taken',
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  sold_price DECIMAL(10,2),
  sold_at TIMESTAMP WITH TIME ZONE,
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_status_history table
CREATE TABLE product_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  from_status product_status NOT NULL,
  to_status product_status NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_comments table
CREATE TABLE product_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  sold_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create environment_invites table
CREATE TABLE environment_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role role NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_environment_id ON products(environment_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_location_id ON products(location_id);
CREATE INDEX idx_memberships_environment_id ON memberships(environment_id);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_product_status_history_product_id ON product_status_history(product_id);
CREATE INDEX idx_product_comments_product_id ON product_comments(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_environment_invites_environment_id ON environment_invites(environment_id);
CREATE INDEX idx_environment_invites_email ON environment_invites(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Environments: Members can read their environments, admins can read all
CREATE POLICY "Members can view their environments" ON environments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = environments.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all environments" ON environments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid() AND m.role IN ('grady_admin', 'grady_staff')
    )
  );

-- Memberships: Users can read memberships in their environments
CREATE POLICY "Users can view memberships in their environments" ON memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = memberships.environment_id AND m.user_id = auth.uid()
    )
  );

-- Products: Members can read products in their environments
CREATE POLICY "Members can view products in their environments" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = products.environment_id AND m.user_id = auth.uid()
    )
  );

-- Staff and admins can modify products
CREATE POLICY "Staff can modify products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.environment_id = products.environment_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('grady_admin', 'grady_staff', 'reseller_manager')
    )
  );

-- Similar policies for other tables...
-- (Additional RLS policies would be added here for production)

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environments_updated_at BEFORE UPDATE ON environments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_comments_updated_at BEFORE UPDATE ON product_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

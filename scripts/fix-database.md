# Fix Database Issues

## Current Issues

1. **Infinite recursion in RLS policies** - The memberships table policies are
   causing infinite loops
2. **Missing system admin support** - The database doesn't support system-wide
   admins yet
3. **Login issues** - Related to the database problems

## Step-by-Step Fix

### 1. Apply the Database Migration

You need to apply the migration to fix the RLS policies. Go to your Supabase
dashboard:

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Go to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Apply the Migration**
   - Copy the contents of `supabase/migrations/002_add_system_admin_support.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

### 2. Test the Database Connection

After applying the migration, test the connection:

```bash
npm run test-db
```

You should see all ✅ success messages.

### 3. Create the Admin User

Once the database is fixed, create the admin user:

```bash
npm run create-admin
```

### 4. Test Login

Try logging in with:

- **Email**: admin@grady.app
- **Password**: 7ftGiMiy.

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref zpmgeatxlvlxvbeoluyn

# Apply migrations
supabase db push

# Test connection
npm run test-db

# Create admin
npm run create-admin
```

## What the Migration Fixes

1. **Removes infinite recursion** in RLS policies
2. **Adds system admin support** with null environment_id
3. **Updates policies** to handle system-wide admins properly
4. **Fixes case sensitivity** issues in table names

## Expected Results

After applying the migration:

- ✅ All database connections should work
- ✅ No more infinite recursion errors
- ✅ Admin user creation should succeed
- ✅ Login should work properly
- ✅ Dashboard should load without errors

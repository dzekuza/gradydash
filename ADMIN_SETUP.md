# Admin Setup Guide

This guide will help you create an admin user and access the Grady ReSellOps
admin dashboard.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up with the
   database migrations applied
2. **Environment Variables**: Ensure your `.env.local` file has the required
   Supabase credentials

## Step 1: Set Up Environment Variables

Create or update your `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 2: Apply Database Migrations

Make sure all database migrations are applied in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:
   - `001_initial_schema.sql`
   - `002_add_system_admin_support.sql`
   - `003_fix_environment_access_policies.sql`
   - `004_fix_rls_policies.sql`
   - `005_add_product_import_fields.sql`
   - `006_add_location_contact_fields.sql`

## Step 3: Create Admin User

### Option A: Using the Script (Recommended)

Run the admin user creation script:

```bash
node scripts/create-admin-user.js
```

This will create a master admin user with:

- **Email**: admin@grady.app
- **Password**: 7ftGiMiy.
- **Role**: admin

### Option B: Manual Creation

If you prefer to create the admin user manually:

1. **Create User in Supabase Auth**:
   - Go to Authentication > Users in your Supabase dashboard
   - Click "Add User"
   - Enter email and password
   - Set email as confirmed

2. **Create Profile**:
   ```sql
   INSERT INTO profiles (id, full_name, first_name, last_name, email)
   VALUES ('user-uuid-from-auth', 'Your Name', 'Your', 'Name', 'your-email@example.com');
   ```

3. **Create Admin Membership**:
   ```sql
   INSERT INTO memberships (user_id, role, environment_id)
   VALUES ('user-uuid-from-auth', 'admin', NULL);
   ```

## Step 4: Access Admin Dashboard

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Login with Admin Credentials**:
   - Go to http://localhost:3000/login
   - Use the admin email and password you created

3. **Access Admin Dashboard**:
   - After login, you'll be redirected to the dashboard
   - Navigate to http://localhost:3000/admin
   - Or click the "Admin Dashboard" link in the user menu

## Admin Dashboard Features

The admin dashboard provides:

### 📊 System Overview

- Total environments (stores)
- Total users
- System status

### 🏢 Environment Management

- View all environments
- Create new environments
- Edit environment settings
- Manage environment members

### 👥 User Management

- View all registered users
- Manage user roles
- View user memberships
- User activity tracking

### 📧 Invitation System

- Send invitations to new users
- Manage pending invitations
- Track invitation status

### ⚙️ System Settings

- Configure system-wide settings
- Manage global preferences
- System maintenance tools

## Admin Roles

### admin (Master Admin)

- Full system access
- Can create/delete environments
- Can manage all users
- Can assign admin roles
- System-wide permissions

### grady_staff (Staff Admin)

- Limited admin access
- Can view all environments
- Can manage users within environments
- Cannot create new admin users

## Creating Production Environments

Once you have admin access, you can create production environments:

1. **Go to Admin Dashboard**: http://localhost:3000/admin
2. **Click "Manage Environments"**
3. **Click "Create Environment"**
4. **Fill in the details**:
   - Name: Your store name
   - Slug: URL-friendly identifier
   - Description: Store description
5. **Invite Users**: Use the invitation system to add team members

## Security Notes

- Change the default admin password after first login
- Use strong passwords for all admin accounts
- Regularly review user permissions
- Monitor system access logs
- Keep your Supabase service role key secure

## Troubleshooting

### "Access Denied" Error

- Ensure the user has a valid admin membership
- Check that the database migrations are applied
- Verify the user is authenticated

### Admin Dashboard Not Loading

- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Supabase connection is working

### Can't Create Environments

- Verify admin role is 'admin'
- Check RLS policies are properly configured
- Ensure user has system-wide admin membership

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure all migrations are applied
4. Check the terminal for server errors

For additional help, refer to the project documentation or create an issue in
the repository.

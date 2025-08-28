# User Registration System

## Overview

The Grady ReSellOps application now supports a new registration system where any
user can register and automatically become a partner admin with their own store
dashboard.

## How It Works

### 1. User Registration

- Users visit `/register` to create a new account
- They provide their name, email, password, and store name
- The system automatically creates a partner (store) for them
- They become a partner admin with full control over their store

### 2. Automatic Partner Creation

When a user registers:

1. A new user account is created in Supabase Auth
2. A database trigger automatically creates a partner with the store name
3. The user is marked as a partner admin (`is_partner_admin = true`)
4. The user is assigned as admin of their primary partner
5. They are redirected to their store dashboard

### 3. Partner Admin Permissions

Partner admins can:

- Manage their own store (products, locations, members)
- Invite users to their store with different roles
- Access all features within their store
- Create additional partners (if needed)

### 4. System Admin vs Partner Admin

- **System Admin**: The original `admin@grady.app` user who can access all
  partners and manage the entire system
- **Partner Admin**: Any registered user who owns and manages their own store(s)

## Database Changes

### New Columns in `profiles` table:

- `is_partner_admin`: Boolean indicating if user is a partner admin
- `primary_partner_id`: UUID reference to the user's primary partner

### New Database Functions:

- `handle_new_user_registration()`: Automatically creates partner for new users
- Updated RLS policies to support partner admin permissions

## User Flow

1. **Registration**: User fills out registration form
2. **Partner Creation**: System automatically creates their store
3. **Dashboard Access**: User is redirected to their store dashboard
4. **Store Management**: User can manage products, locations, and invite team
   members

## Migration Steps

1. Run the new migration:

```bash
supabase db push
```

2. The system will automatically handle new registrations

3. Existing users will need to be manually updated if they should be partner
   admins

## Security

- All RLS policies have been updated to support partner admin permissions
- Partner admins can only access their own partners
- System admins retain full access to all partners
- Invitation system works for both system and partner admins

## Testing

1. Visit `/register` to test the new registration flow
2. Verify that new users get their own store dashboard
3. Test that partner admins can invite users to their store
4. Verify that system admin still has access to all partners

## Future Enhancements

- Partner admins could create multiple stores
- Advanced permission system for different user roles
- Store templates and customization options
- Analytics and reporting for partner admins

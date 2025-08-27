# Role System Simplification

## Overview

Successfully simplified the user role system from 4 complex roles to 2 simple
roles:

### Old Role System (4 roles)

- `admin` - System administrator
- `grady_staff` - System staff
- `reseller_manager` - Store manager
- `reseller_staff` - Store staff

### New Role System (2 roles)

- `admin` - System administrator with full access
- `store_manager` - Store owner with environment management capabilities

## Migration Details

### Database Changes

- **Migration File**: `supabase/migrations/013_simplify_role_system.sql`
- **Role Mapping**:
  - `admin` + `grady_staff` → `admin`
  - `reseller_manager` + `reseller_staff` → `store_manager`
- **Updated RLS Policies**: All policies now use `admin` role instead of
  multiple role checks
- **Updated Indexes**: Admin-specific indexes now reference `admin` role

### Code Changes

#### Type Definitions

- **File**: `src/types/db.ts`
- **Change**: Updated `Role` type from 4 roles to 2 roles

#### RBAC Utilities

- **File**: `src/lib/utils/rbac.ts`
- **Changes**:
  - Simplified role hierarchy (admin: 2, store_manager: 1)
  - Updated permission functions to use new roles
  - Added role display name and description functions

#### Database Functions

- **File**: `src/lib/db/environments/get-user-admin-status.ts`
- **Changes**: Updated to check for `admin` role instead of multiple roles

- **File**: `src/lib/db/environments/get-user-routing-info.ts`
- **Changes**: Simplified interface and updated role checks

- **File**: `src/lib/db/environments/create-environment.ts`
- **Changes**: Updated to use new role system and simplified interface

- **File**: `src/lib/db/environments/delete-environment.ts`
- **Changes**: Updated to require `admin` role for environment deletion

- **File**: `src/lib/db/products/delete-product.ts`
- **Changes**: Updated to allow `store_manager` and `admin` to delete products

#### Validation Schemas

- **File**: `src/lib/utils/zod-schemas/invite.ts`
- **Changes**: Updated to use new role enum values

- **File**: `src/lib/utils/zod-schemas/environment.ts`
- **Changes**: Updated to use new role enum values

#### UI Components

- **File**: `src/components/auth/admin-login-form.tsx`
- **Changes**: Updated to check for `admin` role instead of multiple roles

- **File**: `src/app/(dashboard)/[env]/products/page.tsx`
- **Changes**: Updated permission checks to use new roles

- **File**: `src/app/(dashboard)/[env]/members/page.tsx`
- **Changes**: Updated permission checks and role display

- **File**: `src/app/admin/settings/page.tsx`
- **Changes**: Updated to use new role system

#### New Functions Created

- **File**: `src/lib/db/environments/get-user-membership.ts`
- **Purpose**: Get user membership for a specific environment

- **File**: `src/lib/db/products/get-dashboard-stats.ts`
- **Purpose**: Get comprehensive dashboard statistics

## Permission Matrix

### Admin Role

- ✅ Full system access
- ✅ Create/delete environments
- ✅ Manage all users and memberships
- ✅ Access admin dashboard
- ✅ View all data across environments
- ✅ System configuration

### Store Owner Role

- ✅ Manage products in their environment
- ✅ Invite team members
- ✅ Manage locations
- ✅ View analytics for their environment
- ✅ Update product statuses
- ✅ Delete products

## Benefits of Simplification

1. **Reduced Complexity**: Easier to understand and maintain
2. **Clearer Permissions**: Binary distinction between admin and store
   management
3. **Simplified UI**: Less role selection confusion
4. **Better Security**: Clearer permission boundaries
5. **Easier Onboarding**: New users understand roles immediately

## Migration Status

✅ **Database Migration Applied**: Migration 013 successfully applied ✅ **Code
Updated**: All TypeScript files updated to use new roles ✅ **Type Safety**: All
type definitions updated ✅ **Validation**: All Zod schemas updated ✅ **UI
Components**: All components updated to use new roles ✅ **Testing**: TypeScript
compilation successful

## Next Steps

1. **Test the Application**: Verify all functionality works with new roles
2. **Update Documentation**: Update any user-facing documentation
3. **User Communication**: Inform existing users about role changes
4. **Monitor**: Watch for any issues with the simplified system

## Rollback Plan

If issues arise, the migration can be reverted by:

1. Creating a new migration to restore the old role enum
2. Mapping users back to their original roles
3. Reverting code changes

However, the simplified system should provide better user experience and
maintainability.

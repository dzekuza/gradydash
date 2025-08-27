# TODO List - Role Consolidation Project

## ✅ Completed Tasks

### 1. TypeScript Role Types and RBAC Utils Update

- ✅ Updated `src/types/db.ts` to use only 'admin' and 'store_manager' roles
- ✅ Updated `src/lib/utils/rbac.ts` with simplified role hierarchy and
  permission checks
- ✅ Updated all role-based access control functions to use new roles

### 2. UI Components and Pages Update

- ✅ Updated `src/components/nav-user.tsx` to use 'admin' role for admin badge
- ✅ Updated `src/components/admin/admin-sidebar.tsx` to use simplified admin
  check
- ✅ Updated `src/components/members/invite-member-dialog.tsx` to show only two
  role options
- ✅ Updated `src/components/members/members-data-table.tsx` to handle both
  members and invites
- ✅ Updated `src/components/members/members-table.tsx` with new role badge
  colors
- ✅ Updated `src/app/(dashboard)/[env]/members/page.tsx` with new permission
  checks
- ✅ Updated `src/app/(dashboard)/[env]/page.tsx` to work with simplified
  UserRoutingInfo
- ✅ Updated `src/app/admin/layout.tsx` and
  `src/app/admin/environments/page.tsx`
- ✅ Updated `src/app/dashboard/page.tsx` to use new routing interface

### 3. Zod Schemas and Invitation Flows

- ✅ Updated `src/lib/utils/zod-schemas/environment.ts` to restrict to two roles
- ✅ Updated `src/lib/utils/zod-schemas/invite.ts` to use new role enum
- ✅ Updated invitation logic in `src/lib/db/environments/invite-member.ts`

### 4. Server Admin Checks Update

- ✅ Updated `src/lib/db/environments/get-user-admin-status.ts` to use 'admin'
  only
- ✅ Updated `src/lib/db/environments/get-user-routing-info.ts` with simplified
  interface
- ✅ Updated `src/lib/db/products/delete-product.ts` and
  `src/lib/db/products/bulk-actions.ts`
- ✅ Updated `src/lib/db/environments/create-environment.ts` to use
  'store_manager' default

### 5. Scripts Update

- ✅ Updated `scripts/create-admin-user.js` to create 'admin' role users
- ✅ Updated `scripts/verify-admin-setup.js` to check for 'admin' role
- ✅ Updated `src/components/email/test-email-button.tsx` to use 'store_manager'
  role

### 6. Database Migration

- ✅ Created `supabase/migrations/007_consolidate_roles.sql` with comprehensive
  role consolidation
- ✅ Migration includes:
  - New ROLE enum with only 'admin' and 'store_manager'
  - Data migration from old roles to new roles
  - Updated RLS policies for all tables
  - System admin constraint updates

### 7. Code Cleanup

- ✅ Removed duplicate `src/components/logout-button.tsx`
- ✅ Created missing functions `src/lib/db/environments/get-members.ts` and
  `src/lib/db/environments/get-invites.ts`
- ✅ Fixed all TypeScript compilation errors
- ✅ Successfully built the project with `npm run build`

## 🎯 Project Status: COMPLETED

All tasks have been successfully completed. The codebase now uses only two user
roles:

- **Admin**: System-wide administrators with full access
- **Store Manager**: Environment-specific managers with limited permissions

### Key Changes Made:

1. **Role Consolidation**: Reduced from 4 roles to 2 roles
2. **Simplified RBAC**: Cleaner permission system with clear hierarchy
3. **Database Migration**: Comprehensive SQL migration ready for deployment
4. **UI Updates**: All components updated to reflect new role system
5. **Type Safety**: Full TypeScript compilation with no errors
6. **Build Success**: Project builds successfully with all changes

### Next Steps for Deployment:

1. Run the database migration: `supabase/migrations/007_consolidate_roles.sql`
2. Test the application with the new role system
3. Update any external documentation or user guides
4. Deploy to production

The role consolidation project is now complete and ready for production
deployment.

# Admin Login Route Fix

## Issue

The `/admin-login` route was returning a 404 error because we deleted the
admin-login page during the routing cleanup, but there were still references to
it in the codebase.

## Root Cause

When we cleaned up the routing structure, we removed the `/admin-login` page but
forgot to update:

1. Middleware references to `/admin-login`
2. Login form link to `/admin-login`

## Fixes Applied

### 1. Updated Middleware (`src/middleware.ts`)

- **Removed** `/admin-login` from public routes list
- **Changed** admin route redirect from `/admin-login` to `/login`

### 2. Updated Login Form (`src/components/login-form.tsx`)

- **Removed** "Administrator login" link that pointed to `/admin-login`

## Current Behavior

- All users now use the same login page at `/login`
- System admins are automatically redirected to `/admin` after login
- Environment users are automatically redirected to their environment after
  login
- No more confusion about separate admin login

## Benefits

- ✅ **Simplified Authentication** - Single login flow for all users
- ✅ **No More 404 Errors** - All routes are valid
- ✅ **Better UX** - Users don't need to know about separate admin login
- ✅ **Consistent Flow** - Smart routing based on user role

## Testing

The application should now work correctly:

- `/login` - Works for all users
- `/admin` - Redirects to `/login` if not authenticated, then to `/admin` if
  admin
- `/[env]` - Redirects to `/login` if not authenticated, then to environment if
  authorized

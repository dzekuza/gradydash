# Routing Structure - Grady ReSellOps

## Overview

The application has been reorganized to eliminate confusion between different
types of dashboards and admin areas. Here's the clear, logical structure:

## Route Structure

### 🔐 Authentication Routes

```
/(auth)/
├── login/page.tsx          # User login page
├── register/page.tsx       # User registration page
└── invite/[id]/page.tsx    # Invitation acceptance page
```

### 🏠 Main Routes

```
/
├── page.tsx                # Home page (redirects to login)
├── dashboard/page.tsx      # Dashboard redirect (smart routing)
└── layout.tsx              # Root layout
```

### 🏢 Environment Routes (Multi-tenant)

```
/(dashboard)/[env]/
├── layout.tsx              # Environment layout with sidebar
├── page.tsx                # Environment Dashboard
├── products/               # Product management
│   ├── page.tsx
│   ├── [id]/page.tsx      # Product details (redirects to main)
│   └── new/page.tsx       # New product (redirects to main)
├── locations/              # Location management
│   └── page.tsx
├── members/                # Member management
│   └── page.tsx
├── analytics/              # Environment analytics
│   └── page.tsx
└── settings/               # Environment settings
    └── page.tsx
```

### ⚙️ System Admin Routes

```
/admin/
├── layout.tsx              # Admin layout with admin sidebar
├── page.tsx                # System Admin Dashboard
└── environments/           # Environment management
    └── page.tsx
```

### 🔌 API Routes

```
/api/
├── email/send/route.ts     # Email sending
├── environments/[slug]/route.ts # Environment API
└── locations/[id]/route.ts # Location API
```

## Navigation Flow

### 1. User Login Flow

```
/login → /dashboard → /[env] or /admin
```

### 2. Dashboard Redirect Logic

The `/dashboard` page acts as a smart router:

- **System Admins** → `/admin`
- **Environment Users** → `/[env]` (first available environment)
- **No Access** → No Environments message

### 3. Environment Access

- Users can only access environments they have membership in
- Environment routes are protected by RLS policies
- Each environment has its own isolated data

### 4. Admin Access

- Only users with `admin` or `grady_staff` roles can access `/admin`
- Admin panel provides system-wide management
- Environment creation and user management

## Key Improvements

### ✅ Eliminated Confusion

- **Removed** `/admin-login/` (redundant with regular login)
- **Removed** demo content from `/(dashboard)/demo/`
- **Clarified** naming: "System Admin" vs "Environment Dashboard"

### ✅ Clear Separation

- **System Admin** (`/admin/*`) - System-wide administration
- **Environment Dashboard** (`/[env]/*`) - Environment-specific operations
- **Dashboard Redirect** (`/dashboard`) - Smart routing logic

### ✅ Consistent Naming

- "System Dashboard" for admin overview
- "Environment Dashboard" for environment overview
- "Environment Settings" vs "System Settings"

## User Experience

### For Regular Users

1. Login at `/login`
2. Redirected to `/dashboard`
3. Automatically routed to their environment: `/[env]`
4. Access environment-specific features: products, locations, members, etc.

### For System Admins

1. Login at `/login`
2. Redirected to `/dashboard`
3. Automatically routed to `/admin`
4. Access system-wide features: environment management, user management, etc.

### For Environment Managers

1. Login at `/login`
2. Redirected to `/dashboard`
3. Routed to their environment: `/[env]`
4. Can invite members and manage environment settings

## Security

- All routes require authentication
- Environment access controlled by RLS policies
- Admin access restricted to appropriate roles
- Clear separation between system and environment data

## Benefits

1. **No More Confusion** - Clear distinction between system admin and
   environment dashboards
2. **Logical Flow** - Intuitive navigation from login to appropriate dashboard
3. **Scalable** - Easy to add new environments and admin features
4. **Secure** - Proper access control at every level
5. **Maintainable** - Clean, organized code structure

# Scripts

This directory contains utility scripts for managing the Grady ReSellOps
Dashboard.

## Available Scripts

### `create-admin-user.js`

Creates a new admin user in the system. This script is required for initial
setup.

**Usage:**

```bash
node scripts/create-admin-user.js
```

**What it does:**

- Prompts for admin user credentials
- Creates a new user profile with admin role
- Sets up proper environment access
- Required for first-time setup

### `verify-admin-setup.js`

Verifies that the admin user setup is correct and functional.

**Usage:**

```bash
node scripts/verify-admin-setup.js
```

**What it does:**

- Checks if admin user exists
- Verifies admin role assignment
- Tests admin access to environments
- Useful for troubleshooting admin access issues

## Setup Instructions

1. **Create Admin User** (Required for first-time setup):
   ```bash
   node scripts/create-admin-user.js
   ```

2. **Verify Setup** (Optional, for troubleshooting):
   ```bash
   node scripts/verify-admin-setup.js
   ```

## Notes

- These scripts require proper environment variables to be set
- Make sure your Supabase project is properly configured
- Run these scripts from the project root directory
- The admin user creation script is referenced in the main README.md

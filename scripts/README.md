# Admin User Setup

This directory contains scripts for setting up the master admin user for Grady
ReSellOps.

## Prerequisites

1. **Supabase Service Role Key**: You need the Supabase service role key to
   create users programmatically. This can be found in your Supabase dashboard
   under Settings > API.

2. **Environment Variables**: Make sure you have the following in your
   `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Database Migration

Before creating the admin user, you need to run the database migration to
support system-wide admins:

```bash
# Apply the migration to your Supabase database
# This can be done through the Supabase dashboard or CLI
```

## Creating the Master Admin User

Run the following command to create the master admin user:

```bash
npm run create-admin
```

This will create a user with the following credentials:

- **Email**: admin@grady.app
- **Password**: 7ftGiMiy.
- **Role**: grady_admin (system-wide admin)

## Admin Capabilities

The master admin user can:

- **Create new environments (stores)**: Set up new reseller environments
- **Invite users**: Send invitations to join specific environments
- **Access all environments**: View and manage all environments in the system
- **Manage users**: Add, remove, and modify user roles across environments
- **System-wide settings**: Access global system configuration

## Security Notes

- The service role key has elevated permissions - keep it secure
- The admin password should be changed after first login
- Consider enabling 2FA for the admin account
- Regularly audit admin access and permissions

## Troubleshooting

If you encounter issues:

1. **Check environment variables**: Ensure all required variables are set
2. **Verify Supabase connection**: Test the connection to your Supabase instance
3. **Check database permissions**: Ensure the service role has necessary
   permissions
4. **Review migration status**: Make sure the database migration has been
   applied

## Next Steps

After creating the admin user:

1. Log in with the admin credentials
2. Create your first environment (store)
3. Invite team members to the environment
4. Set up locations and start managing products

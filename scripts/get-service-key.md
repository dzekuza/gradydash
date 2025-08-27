# Getting Your Supabase Service Role Key

## Steps to Get Your Service Role Key

1. **Go to your Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in to your account

2. **Select Your Project**
   - Click on your Grady ReSellOps project

3. **Navigate to Settings**
   - In the left sidebar, click on "Settings"
   - Then click on "API"

4. **Copy the Service Role Key**
   - Look for the "service_role" key (it starts with `eyJ...`)
   - Click the copy button next to it
   - **⚠️ Keep this key secure - it has elevated permissions**

5. **Add to Your Environment**
   - Add this key to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Security Warning

The service role key has elevated permissions and can:

- Bypass Row Level Security (RLS)
- Create, read, update, and delete any data
- Manage users and authentication

**Never commit this key to version control or share it publicly.**

## Alternative: Using Supabase CLI

If you have the Supabase CLI installed, you can also get the key via:

```bash
supabase status
```

This will show you the project URL and anon key, but you'll still need to get
the service role key from the dashboard.

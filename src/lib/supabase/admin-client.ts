import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin operations (bypasses RLS)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

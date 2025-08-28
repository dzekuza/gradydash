'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export async function getCurrentProfile(cookieStore?: ReadonlyRequestCookies) {
  try {
    const supabase = createClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }

    // Use service client to bypass RLS for profile fetching
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the user's profile using service client
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Profile fetch error:', error)
    return null
  }
}

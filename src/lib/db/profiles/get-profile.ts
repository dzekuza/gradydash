'use server'

import { createClient } from '@/lib/supabase/client-server'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export async function getCurrentProfile(cookieStore?: ReadonlyRequestCookies) {
  try {
    const supabase = createClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }

    // Get the user's profile
    const { data: profile, error } = await supabase
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

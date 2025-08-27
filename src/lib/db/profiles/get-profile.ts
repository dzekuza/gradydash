'use server'

import { createClient } from '@/lib/supabase/client-server'

export async function getCurrentProfile() {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // Return a demo profile for demo environments
      console.log('No authenticated user found - returning demo profile')
      return {
        id: 'demo-user-id',
        first_name: 'Demo',
        last_name: 'User',
        full_name: 'Demo User',
        email: 'demo@grady.com',
        bio: 'Demo user for testing the Grady ReSellOps dashboard.',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
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

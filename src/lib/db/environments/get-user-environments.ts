'use server'

import { createClient } from '@/lib/supabase/client-server'

export async function getUserEnvironments() {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return []
    }

    // Get environments where the user is a member
    const { data: environments, error } = await supabase
      .from('environments')
      .select(`
        id,
        name,
        slug,
        description,
        created_at
      `)
      .order('name')

    if (error) {
      console.error('Error fetching user environments:', error)
      return []
    }

    return environments || []
  } catch (error) {
    console.error('Error in getUserEnvironments:', error)
    return []
  }
}

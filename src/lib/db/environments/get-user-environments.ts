'use server'

import { createClient } from '@/lib/supabase/client-server'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Internal function that does the actual data fetching
async function _getUserEnvironments(cookieStore?: ReadonlyRequestCookies) {
  try {
    const supabase = createClient(cookieStore)
    
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

// Cached version of getUserEnvironments
export const getUserEnvironments = unstable_cache(
  _getUserEnvironments,
  ['get-user-environments'],
  {
    revalidate: CACHE_CONFIGS.MEDIUM.revalidate,
    tags: [CACHE_TAGS.ENVIRONMENTS, CACHE_TAGS.USER_PROFILES]
  }
)

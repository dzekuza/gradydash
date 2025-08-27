import { createClient } from '@/lib/supabase/client-server'
import { Location } from '@/types/db'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Internal function that does the actual data fetching
async function _getLocations(environmentId: string, cookieStore?: ReadonlyRequestCookies): Promise<Location[]> {
  const supabase = createClient(cookieStore)
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId(cookieStore) 
      : environmentId

    const { data, error } = await supabase
      .from('locations')
      .select(`
        id,
        environment_id,
        name,
        description,
        address,
        contact_person_name,
        contact_email,
        contact_phone,
        created_at,
        updated_at
      `)
      .eq('environment_id', actualEnvironmentId)
      .order('name')

    if (error) {
      console.error('Error fetching locations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getLocations:', error)
    return []
  }
}

// Cached version of getLocations
export const getLocations = unstable_cache(
  _getLocations,
  ['get-locations'],
  {
    revalidate: CACHE_CONFIGS.MEDIUM.revalidate,
    tags: [CACHE_TAGS.LOCATIONS, CACHE_TAGS.ENVIRONMENTS]
  }
)

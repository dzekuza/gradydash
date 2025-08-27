import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Internal function for getting environments for a user
async function _getEnvironmentsForUser(userId: string, cookieStore?: ReadonlyRequestCookies): Promise<Environment[]> {
  const supabase = createClient(cookieStore)
  
  // Get environment IDs where user has membership
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('environment_id')
    .eq('user_id', userId)

  if (membershipsError) {
    console.error('Error fetching memberships:', membershipsError)
    return []
  }

  const membershipEnvironmentIds = memberships?.map(m => m.environment_id) || []

  // Build filters safely; avoid id.in.() when there are no memberships
  let envQuery = supabase
    .from('environments')
    .select(`
      id,
      name,
      slug,
      description,
      created_by,
      created_at,
      updated_at
    `)

  if (membershipEnvironmentIds.length === 0) {
    envQuery = envQuery.eq('created_by', userId)
  } else {
    const quoted = membershipEnvironmentIds.map(id => `"${id}"`).join(',')
    envQuery = envQuery.or(`created_by.eq.${userId},id.in.(${quoted})`)
  }

  const { data: environments, error: environmentsError } = await envQuery.order('name')

  if (environmentsError) {
    console.error('Error fetching environments:', environmentsError)
    return []
  }

  return environments || []
}

// Internal function for getting environment by slug
async function _getEnvironmentBySlug(slug: string, cookieStore?: ReadonlyRequestCookies): Promise<Environment | null> {
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('environments')
    .select(`
      id,
      name,
      slug,
      description,
      created_by,
      created_at,
      updated_at
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching environment:', error)
    return null
  }

  return data
}

// Cached versions of the functions
export const getEnvironmentsForUser = unstable_cache(
  _getEnvironmentsForUser,
  ['get-environments-for-user'],
  {
    revalidate: CACHE_CONFIGS.MEDIUM.revalidate,
    tags: [CACHE_TAGS.ENVIRONMENTS, CACHE_TAGS.MEMBERSHIPS, CACHE_TAGS.USER_PROFILES]
  }
)

export const getEnvironmentBySlug = unstable_cache(
  _getEnvironmentBySlug,
  ['get-environment-by-slug'],
  {
    revalidate: CACHE_CONFIGS.LONG.revalidate,
    tags: [CACHE_TAGS.ENVIRONMENTS]
  }
)

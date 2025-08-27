import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const DEMO_ENVIRONMENT_SLUG = 'demo'

// Internal function for getting or creating demo environment
async function _getOrCreateDemoEnvironment(cookieStore?: ReadonlyRequestCookies): Promise<Environment> {
  const supabase = createClient(cookieStore)
  
  try {
    // First try to get the existing demo environment
    const { data: existingEnv, error: fetchError } = await supabase
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
      .eq('slug', DEMO_ENVIRONMENT_SLUG)
      .single()

    if (existingEnv) {
      return existingEnv
    }

    // If demo environment doesn't exist, create it
    const { data: newEnv, error: createError } = await supabase
      .from('environments')
      .insert({
        name: 'Demo Environment',
        slug: DEMO_ENVIRONMENT_SLUG,
        description: 'Demo environment for testing and development',
        created_by: null // Demo environment has no specific creator
      })
      .select(`
        id,
        name,
        slug,
        description,
        created_by,
        created_at,
        updated_at
      `)
      .single()

    if (createError) {
      console.error('Error creating demo environment:', createError)
      // If we can't create the demo environment, return a fallback
      return {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Demo Environment',
        slug: DEMO_ENVIRONMENT_SLUG,
        description: 'Demo environment for testing and development',
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return newEnv
  } catch (error) {
    console.error('Unexpected error in getOrCreateDemoEnvironment:', error)
    // Return a fallback environment
    return {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Demo Environment',
      slug: DEMO_ENVIRONMENT_SLUG,
      description: 'Demo environment for testing and development',
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

// Internal function for getting demo environment ID
async function _getDemoEnvironmentId(cookieStore?: ReadonlyRequestCookies): Promise<string> {
  const demoEnv = await _getOrCreateDemoEnvironment(cookieStore)
  return demoEnv.id
}

// Cached versions of the functions
export const getOrCreateDemoEnvironment = unstable_cache(
  _getOrCreateDemoEnvironment,
  ['get-or-create-demo-environment'],
  {
    revalidate: CACHE_CONFIGS.VERY_LONG.revalidate,
    tags: [CACHE_TAGS.ENVIRONMENTS, CACHE_TAGS.DEMO_DATA]
  }
)

export const getDemoEnvironmentId = unstable_cache(
  _getDemoEnvironmentId,
  ['get-demo-environment-id'],
  {
    revalidate: CACHE_CONFIGS.VERY_LONG.revalidate,
    tags: [CACHE_TAGS.ENVIRONMENTS, CACHE_TAGS.DEMO_DATA]
  }
)

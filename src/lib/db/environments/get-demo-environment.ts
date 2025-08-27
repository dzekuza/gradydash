import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'

const DEMO_ENVIRONMENT_SLUG = 'demo'

export async function getOrCreateDemoEnvironment(): Promise<Environment> {
  const supabase = createClient()
  
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

export async function getDemoEnvironmentId(): Promise<string> {
  const demoEnv = await getOrCreateDemoEnvironment()
  return demoEnv.id
}

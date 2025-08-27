import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'

export async function getEnvironmentsForUser(userId: string): Promise<Environment[]> {
  const supabase = createClient()
  
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

export async function getEnvironmentBySlug(slug: string): Promise<Environment | null> {
  const supabase = createClient()
  
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


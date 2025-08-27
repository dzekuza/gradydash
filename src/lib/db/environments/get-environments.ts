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

  const membershipEnvironmentIds = memberships?.map(m => m.environment_id).filter(id => id !== null) || []

  // Build query based on memberships
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
    // If no memberships, only show environments created by the user
    envQuery = envQuery.eq('created_by', userId)
  } else {
    // Show environments where user has membership OR environments created by the user
    envQuery = envQuery.in('id', membershipEnvironmentIds)
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
  
  try {
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
      // Handle the case where no environment is found (PGRST116)
      if (error.code === 'PGRST116') {
        console.log(`Environment with slug '${slug}' not found`)
        return null
      }
      console.error('Error fetching environment:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getEnvironmentBySlug:', error)
    return null
  }
}


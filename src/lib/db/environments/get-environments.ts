import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'

export async function getEnvironmentsForUser(userId: string): Promise<Environment[]> {
  const supabase = createClient()
  
  // Get partner IDs where user has membership
  const { data: memberships, error: membershipsError } = await supabase
    .from('memberships')
    .select('partner_id')
    .eq('user_id', userId)

  if (membershipsError) {
    console.error('Error fetching memberships:', membershipsError)
    return []
  }

  const membershipPartnerIds = memberships?.map(m => m.partner_id).filter(id => id !== null) || []

  // Build query based on memberships
  let envQuery = supabase
    .from('partners')
    .select(`
      id,
      name,
      slug,
      description,
      created_by,
      created_at,
      updated_at
    `)

  if (membershipPartnerIds.length === 0) {
    // If no memberships, only show partners created by the user
    envQuery = envQuery.eq('created_by', userId)
  } else {
    // Show partners where user has membership OR partners created by the user
    envQuery = envQuery.in('id', membershipPartnerIds)
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
      .from('partners')
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
      // Handle the case where no partner is found (PGRST116)
      if (error.code === 'PGRST116') {
        if (process.env.NODE_ENV === 'development') {
        console.log(`Partner with slug '${slug}' not found`)
      }
        return null
      }
      console.error('Error fetching partner:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getEnvironmentBySlug:', error)
    return null
  }
}


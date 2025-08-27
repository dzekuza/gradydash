import { createClient } from '@/lib/supabase/client-server'
import { Environment } from '@/types/db'

export async function getEnvironmentsForUser(userId: string): Promise<Environment[]> {
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
    .eq('memberships.user_id', userId)
    .order('name')

  if (error) {
    console.error('Error fetching environments:', error)
    return []
  }

  return data || []
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

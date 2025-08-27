'use server'

import { createClient } from '@/lib/supabase/client-server'

export async function getAllEnvironments() {
  const supabase = createClient()

  try {
    const { data: environments, error } = await supabase
      .from('environments')
      .select('id, name, slug, description')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching environments:', error)
      throw new Error('Failed to fetch environments')
    }

    return environments || []
  } catch (error) {
    console.error('Error in getAllEnvironments:', error)
    throw error
  }
}

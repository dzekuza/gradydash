import { createClient } from '@/lib/supabase/client-server'
import { Location } from '@/types/db'

export async function getLocations(environmentId: string): Promise<Location[]> {
  const supabase = createClient()
  
  try {
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
      .eq('environment_id', environmentId)
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


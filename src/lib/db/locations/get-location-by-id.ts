import { createClient } from '@/lib/supabase/client-server'
import { Location } from '@/types/db'

export async function getLocationById(locationId: string): Promise<Location | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        description,
        address,
        contact_person_name,
        contact_email,
        contact_phone,
        partner_id,
        created_at,
        updated_at
      `)
      .eq('id', locationId)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getLocationById:', error)
    return null
  }
}

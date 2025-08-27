import { createClient } from '@/lib/supabase/client-server'

export interface LocationStats {
  id: string
  name: string
  productCount: number
}

export async function getLocationStats(environmentId: string): Promise<LocationStats[]> {
  const supabase = createClient()
  
  try {
    // Get all locations for the environment
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id, name')
      .eq('environment_id', environmentId)

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
      return []
    }

    if (!locations || locations.length === 0) {
      return []
    }

    // Get product counts for each location
    const locationStats: LocationStats[] = []
    
    for (const location of locations) {
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('environment_id', environmentId)
        .eq('location_id', location.id)

      if (countError) {
        console.error(`Error counting products for location ${location.id}:`, countError)
        locationStats.push({
          id: location.id,
          name: location.name,
          productCount: 0
        })
      } else {
        locationStats.push({
          id: location.id,
          name: location.name,
          productCount: count || 0
        })
      }
    }

    return locationStats
  } catch (error) {
    console.error('Unexpected error in getLocationStats:', error)
    return []
  }
}


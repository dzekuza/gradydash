import { createClient } from '@/lib/supabase/client-server'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export interface LocationStats {
  id: string
  name: string
  productCount: number
  totalValue: number
}

// Internal function that does the actual data fetching
async function _getLocationStats(environmentId: string, cookieStore?: ReadonlyRequestCookies): Promise<LocationStats[]> {
  const supabase = createClient(cookieStore)
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId(cookieStore) 
      : environmentId

    // Get all locations for the environment
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id, name')
      .eq('environment_id', actualEnvironmentId)

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
      return []
    }

    if (!locations || locations.length === 0) {
      return []
    }

    // Get product counts and values for each location
    const locationStats = await Promise.all(
      locations.map(async (location) => {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('selling_price')
          .eq('location_id', location.id)

        if (productsError) {
          console.error('Error fetching products for location:', location.id, productsError)
          return {
            id: location.id,
            name: location.name,
            productCount: 0,
            totalValue: 0
          }
        }

        const productCount = products?.length || 0
        const totalValue = products?.reduce((sum, product) => 
          sum + (product.selling_price ? Number(product.selling_price) : 0), 0
        ) || 0

        return {
          id: location.id,
          name: location.name,
          productCount,
          totalValue
        }
      })
    )

    return locationStats
  } catch (error) {
    console.error('Unexpected error in getLocationStats:', error)
    return []
  }
}

// Cached version of getLocationStats
export const getLocationStats = unstable_cache(
  _getLocationStats,
  ['get-location-stats'],
  {
    revalidate: CACHE_CONFIGS.SHORT.revalidate,
    tags: [CACHE_TAGS.LOCATIONS, CACHE_TAGS.PRODUCTS, CACHE_TAGS.ENVIRONMENTS]
  }
)

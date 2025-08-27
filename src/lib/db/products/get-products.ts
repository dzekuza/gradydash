import { createClient } from '@/lib/supabase/client-server'
import { Product } from '@/types/db'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { unstable_cache } from 'next/cache'
import { CACHE_CONFIGS, CACHE_TAGS } from '@/lib/utils/cache'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Internal function that does the actual data fetching
async function _getProducts(environmentId: string, cookieStore?: ReadonlyRequestCookies): Promise<Product[]> {
  const supabase = createClient(cookieStore)
  
  try {
    // Handle demo environment
    const actualEnvironmentId = environmentId === 'demo-env' || environmentId === 'temp-id'
      ? await getDemoEnvironmentId(cookieStore) 
      : environmentId

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        environment_id,
        title,
        sku,
        barcode,
        description,
        status,
        location_id,
        purchase_price,
        selling_price,
        status_updated_at,
        created_at,
        updated_at
      `)
      .eq('environment_id', actualEnvironmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getProducts:', error)
    return []
  }
}

// Cached version of getProducts
export const getProducts = unstable_cache(
  _getProducts,
  ['get-products'],
  {
    revalidate: CACHE_CONFIGS.SHORT.revalidate,
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.ENVIRONMENTS]
  }
)

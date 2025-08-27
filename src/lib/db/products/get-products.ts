import { createClient } from '@/lib/supabase/client-server'
import { Product } from '@/types/db'

export async function getProducts(environmentId: string): Promise<Product[]> {
  const supabase = createClient()
  
  try {
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
      .eq('environment_id', environmentId)
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


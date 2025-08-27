'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { CACHE_TAGS } from '@/lib/utils/cache'

interface ImportProduct {
  title: string
  sku?: string
  barcode?: string
  description?: string
  status: string
  location_id?: string
  purchase_price?: number
  selling_price?: number
  categories?: string[]
  tags?: string[]
}

export async function importProducts(products: ImportProduct[], environmentId?: string) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Check if we're in demo mode
    const isDemoMode = !environmentId || environmentId === 'demo' || !user
    
    if (userError) {
      console.error('User authentication error:', userError)
      // In demo mode, we'll continue without authentication
      if (!isDemoMode) {
        throw new Error('Authentication error: ' + userError.message)
      }
    }
    
    if (!user && !isDemoMode) {
      throw new Error('Authentication required')
    }

    // Get the actual environment ID
    const actualEnvironmentId = environmentId === 'demo' || !environmentId
      ? await getDemoEnvironmentId() 
      : environmentId

    console.log('Importing products for environment:', actualEnvironmentId)

    // Prepare products for insertion
    const productsToInsert = products.map(product => ({
      ...product,
      environment_id: actualEnvironmentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert products in batches to avoid hitting limits
    const batchSize = 100
    const batches = []
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      batches.push(productsToInsert.slice(i, i + batchSize))
    }

    let totalInserted = 0
    const errors: string[] = []

    for (const batch of batches) {
      const { data: insertedProducts, error: batchError } = await supabase
        .from('products')
        .insert(batch)
        .select('id')

      if (batchError) {
        console.error('Error inserting batch:', batchError)
        errors.push(`Batch error: ${batchError.message}`)
      } else {
        totalInserted += insertedProducts?.length || 0
      }
    }

    console.log(`Import completed: ${totalInserted} products imported`)

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS)
    revalidateTag(CACHE_TAGS.ENVIRONMENTS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    revalidatePath('/demo')
    revalidatePath(`/${environmentId}/products`)
    revalidatePath(`/${environmentId}`)

    return {
      success: true,
      imported: totalInserted,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Error in importProducts:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while importing products')
  }
}

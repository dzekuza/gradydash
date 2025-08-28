'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { createProductSchema } from '@/lib/utils/zod-schemas/product'

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
}

export async function importProducts(products: ImportProduct[], environmentId?: string) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get user's environment if not provided
    if (!environmentId) {
      const { data: memberships } = await supabase
        .from('memberships')
        .select('environment_id')
        .eq('user_id', user.id)
        .limit(1)
      
      if (!memberships || memberships.length === 0) {
        throw new Error('No environment found for user')
      }
      environmentId = memberships[0].environment_id
    }

    // Get environment slug for revalidation
    const { data: environment } = await supabase
      .from('environments')
      .select('slug')
      .eq('id', environmentId)
      .single()

    if (!environment) {
      throw new Error('Environment not found')
    }

    let totalInserted = 0
    const errors: string[] = []

    // Process each product
    for (const product of products) {
      try {
        // Validate product data
        const validation = createProductSchema.safeParse(product)
        if (!validation.success) {
          errors.push(`Product "${product.title}": ${validation.error.errors.map(e => e.message).join(', ')}`)
          continue
        }

        // Insert product
        const { data: insertedProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            environment_id: environmentId,
            ...validation.data,
            created_by: user.id
          })
          .select()
          .single()

        if (insertError) {
          errors.push(`Product "${product.title}": ${insertError.message}`)
          continue
        }

        // Add status history entry
        await supabase
          .from('product_status_history')
          .insert({
            product_id: insertedProduct.id,
            from_status: null,
            to_status: validation.data.status,
            changed_by: user.id,
            notes: 'Product imported'
          })

        totalInserted++
      } catch (error) {
        errors.push(`Product "${product.title}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }


    // Revalidate paths for immediate UI updates
    revalidatePath(`/${environment.slug}/products`)
    revalidatePath(`/${environment.slug}`)

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

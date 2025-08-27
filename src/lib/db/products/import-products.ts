'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

interface CSVProduct {
  title: string
  sku?: string
  barcode?: string
  description?: string
  status: 'taken' | 'in_repair' | 'selling' | 'sold' | 'returned' | 'discarded'
  purchase_price?: number
  selling_price?: number
  location_name?: string
}

export async function importProductsFromCSV(formData: FormData) {
  const supabase = createClient()
  
  const environmentId = formData.get('environmentId') as string
  const productsJson = formData.get('products') as string

  if (!environmentId || !productsJson) {
    throw new Error('Missing required data')
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check if user has permission to create products in this environment
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('environment_id', environmentId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      throw new Error('You do not have permission to import products to this environment')
    }

    // Only allow reseller_manager and above to import products
    if (!['reseller_manager', 'grady_staff', 'grady_admin'].includes(membership.role)) {
      throw new Error('You do not have permission to import products')
    }

    const products: CSVProduct[] = JSON.parse(productsJson)

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('No valid products to import')
    }

    // Get locations for this environment to map location names to IDs
    const { data: locations } = await supabase
      .from('locations')
      .select('id, name')
      .eq('environment_id', environmentId)

    const locationMap = new Map(locations?.map(loc => [loc.name.toLowerCase(), loc.id]) || [])

    // Prepare products for insertion
    const productsToInsert = products.map(product => {
      const productData: any = {
        environment_id: environmentId,
        title: product.title,
        status: product.status,
        status_updated_at: new Date().toISOString(),
      }

      // Add optional fields if they exist
      if (product.sku) productData.sku = product.sku
      if (product.barcode) productData.barcode = product.barcode
      if (product.description) productData.description = product.description
      if (product.purchase_price) productData.purchase_price = product.purchase_price
      if (product.selling_price) productData.selling_price = product.selling_price

      // Map location name to location ID
      if (product.location_name) {
        const locationId = locationMap.get(product.location_name.toLowerCase())
        if (locationId) {
          productData.location_id = locationId
        }
      }

      return productData
    })

    // Insert products in batches to avoid hitting limits
    const batchSize = 50
    const results = []

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize)
      
      const { data: insertedProducts, error: insertError } = await supabase
        .from('products')
        .insert(batch)
        .select()

      if (insertError) {
        console.error('Error inserting batch:', insertError)
        throw new Error(`Failed to import products: ${insertError.message}`)
      }

      results.push(...(insertedProducts || []))
    }

    console.log('Products imported successfully:', {
      environmentId,
      count: results.length,
      importedBy: user.id
    })

    revalidatePath(`/[env]/products`)
    return { success: true, count: results.length }
  } catch (error) {
    console.error('Error in importProductsFromCSV:', error)
    throw error
  }
}

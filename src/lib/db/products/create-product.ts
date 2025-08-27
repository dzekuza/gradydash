'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProductSchema } from '@/lib/utils/zod-schemas/product'
import { getEnvironmentsForUser } from '@/lib/db/environments/get-environments'

export async function createProduct(formData: FormData) {
  const supabase = createClient()
  
  const title = formData.get('title') as string
  const sku = formData.get('sku') as string
  const barcode = formData.get('barcode') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const locationId = formData.get('location_id') as string
  const purchasePrice = formData.get('purchase_price') as string
  const sellingPrice = formData.get('selling_price') as string
  const categories = formData.get('categories') as string
  const redirectTo = formData.get('redirectTo') as string

  // Validate input
  const validation = createProductSchema.safeParse({
    title,
    sku,
    barcode,
    description,
    status,
    location_id: locationId,
    purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
    selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined,
    categories: categories ? JSON.parse(categories) : undefined
  })

  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.errors.map((e: any) => e.message).join(', '))
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get user's environment
    const environments = await getEnvironmentsForUser(user.id)
    const environment = environments[0] // Use first environment for now
    const environmentId = environment?.id

    if (!environmentId) {
      throw new Error('No environment found')
    }

    const basePath = `/${environment.slug}`

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        environment_id: environmentId,
        ...validation.data,
        created_by: user.id
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating product:', productError)
      throw new Error('Failed to create product: ' + productError.message)
    }

    // Add status history entry
    const { error: historyError } = await supabase
      .from('product_status_history')
      .insert({
        product_id: product.id,
        from_status: null,
        to_status: validation.data.status,
        changed_by: user.id,
        note: 'Product created'
      })

    if (historyError) {
      console.error('Error creating status history:', historyError)
      // Don't throw error here as the main product creation succeeded
    }


    // Revalidate paths for immediate UI updates
    revalidatePath(`${basePath}/products`)
    revalidatePath(basePath)

  } catch (error) {
    console.error('Error in createProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the product')
  }

  // Redirect to the product detail page
  if (redirectTo) {
    redirect(redirectTo)
  }
}

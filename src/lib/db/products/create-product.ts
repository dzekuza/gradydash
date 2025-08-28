'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createProductSchema } from '@/lib/utils/zod-schemas/product'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'

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
  const environmentId = formData.get('partner_id') as string

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

    // Check user's admin status
    const { isSystemAdmin } = await getUserAdminStatus(user.id)

    let targetEnvironmentId = environmentId
    let environmentSlug = ''

    if (targetEnvironmentId) {
      // Verify the partner exists and user has access
      const { data: environment, error: envError } = await supabase
        .from('partners')
        .select('id, slug')
        .eq('id', targetEnvironmentId)
        .single()

      if (envError || !environment) {
        throw new Error('Partner not found')
      }

      // Check if user has access to this partner
      if (!isSystemAdmin) {
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('id')
          .eq('partner_id', targetEnvironmentId)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membership) {
          throw new Error('You do not have permission to create products in this partner')
        }
      }

      environmentSlug = environment.slug
    } else {
      throw new Error('Environment ID is required')
    }

    const basePath = `/${environmentSlug}`

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        partner_id: targetEnvironmentId,
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
        notes: 'Product created'
      })

    if (historyError) {
      console.error('Error creating status history:', historyError)
      // Don't throw error here as the main product creation succeeded
    }

    // Revalidate paths for immediate UI updates
    revalidatePath(`${basePath}/products`)
    revalidatePath(basePath)

    // Return the created product
    return { success: true, product }

  } catch (error) {
    console.error('Error in createProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the product')
  }
}

'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { updateProductSchema } from '@/lib/utils/zod-schemas/product'

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = createClient()
  
  const title = formData.get('title') as string
  const sku = formData.get('sku') as string
  const barcode = formData.get('barcode') as string
  const description = formData.get('description') as string
  const locationId = formData.get('location_id') as string
  const purchasePrice = formData.get('purchase_price') as string
  const sellingPrice = formData.get('selling_price') as string
  const categories = formData.get('categories') as string

  // Validate input
  const validation = updateProductSchema.safeParse({
    id: productId,
    title,
    sku,
    barcode,
    description,
    location_id: locationId,
    purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
    selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined,
    categories: categories ? JSON.parse(categories) : undefined
  })

  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.errors.map(e => e.message).join(', '))
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get the product to find its partner
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('partner_id, partners!inner(slug)')
      .eq('id', productId)
      .single()

    if (fetchError || !existingProduct) {
      throw new Error('Product not found')
    }

    // Update the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (productError) {
      console.error('Error updating product:', productError)
      throw new Error('Failed to update product: ' + productError.message)
    }

    if (!product) {
      throw new Error('Product not found')
    }


    // Revalidate paths for immediate UI updates
    const environmentSlug = existingProduct.partners[0].slug
    revalidatePath(`/${environmentSlug}/products`)
    revalidatePath(`/${environmentSlug}`)

    return { success: true, product }
  } catch (error) {
    console.error('Error in updateProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while updating the product')
  }
}

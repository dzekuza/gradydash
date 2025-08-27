'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { updateProductSchema } from '@/lib/utils/zod-schemas/product'
import { CACHE_TAGS } from '@/lib/utils/cache'

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Parse categories from form data
    const categoriesJson = formData.get('categories') as string
    let categories: string[] | undefined
    
    if (categoriesJson) {
      try {
        categories = JSON.parse(categoriesJson)
      } catch (error) {
        console.warn('Failed to parse categories JSON:', error)
        categories = undefined
      }
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
      location_id: formData.get('location_id') as string,
      purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price') as string) : undefined,
      selling_price: formData.get('selling_price') ? parseFloat(formData.get('selling_price') as string) : undefined,
      categories,
    }

    // Validate the data
    const validatedData = updateProductSchema.parse(rawData)

    // Update the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        ...validatedData,
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

    console.log('Product updated successfully:', product.id)

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    revalidatePath('/demo')

    return { success: true, product }
  } catch (error) {
    console.error('Error in updateProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while updating the product')
  }
}

'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateProductSchema } from '@/lib/utils/zod-schemas/product'

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication error: ' + userError.message)
    }
    
    if (!user) {
      throw new Error('Authentication required')
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
    }

    // Validate the data
    const validatedData = updateProductSchema.parse(rawData)

    console.log('Updating product with:', { productId, ...validatedData })

    // Update the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        ...validatedData,
        status_updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (productError) {
      console.error('Error updating product:', productError)
      throw new Error('Failed to update product: ' + productError.message)
    }

    if (!product) {
      throw new Error('Product was not found')
    }

    console.log('Product updated successfully:', product.id)

    // Revalidate the products page
    revalidatePath('/demo/products')
    revalidatePath('/demo')

    // Redirect to the products page
    redirect('/demo/products')

  } catch (error) {
    console.error('Error in updateProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while updating the product')
  }
}

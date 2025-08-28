'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { ProductStatus } from '@/types/db'

export async function updateProductStatus(
  productId: string, 
  newStatus: string, 
  environmentSlug: string
) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get the current product to check its status
    const { data: currentProduct, error: productError } = await supabase
      .from('products')
      .select('status, partner_id')
      .eq('id', productId)
      .single()

    if (productError || !currentProduct) {
      throw new Error('Product not found')
    }

    // Update the product status
    const { error: updateError } = await supabase
      .from('products')
      .update({
        status: newStatus as ProductStatus,
        status_updated_at: new Date().toISOString()
      })
      .eq('id', productId)

    if (updateError) {
      throw new Error('Failed to update product status')
    }

    // Add status history entry
    const { error: historyError } = await supabase
      .from('product_status_history')
      .insert({
        product_id: productId,
        from_status: currentProduct.status,
        to_status: newStatus as ProductStatus,
        changed_by: user.id,
        notes: `Status changed from ${currentProduct.status} to ${newStatus}`
      })

    if (historyError) {
      console.error('Error creating status history:', historyError)
      // Don't throw error here as the main status update succeeded
    }

    // Revalidate paths for immediate UI updates
    revalidatePath(`/${environmentSlug}/products`)
    revalidatePath(`/${environmentSlug}`)

    return { success: true }
  } catch (error) {
    console.error('Error in updateProductStatus:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to update product status')
  }
}

'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/utils/cache'

export async function deleteProduct(productId: string) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check if user has permission to delete the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('environment_id')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      throw new Error('Product not found')
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('environment_id', product.environment_id)
      .single()

    if (membershipError || !membership) {
      throw new Error('You do not have permission to delete this product')
    }

    // Only allow store_manager and admin to delete products
    if (!['store_manager', 'admin'].includes(membership.role)) {
      throw new Error('You do not have permission to delete products')
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      throw new Error('Failed to delete product')
    }

    console.log('Product deleted successfully:', productId)

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    revalidatePath('/demo')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteProduct:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while deleting the product')
  }
}

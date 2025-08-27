'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(productId: string, userId: string, environmentId: string) {
  const supabase = createClient()

  // Check if user has permission to delete products in this environment
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('environment_id', environmentId)
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    throw new Error('You do not have permission to delete products in this environment')
  }

  // Only allow store_manager and admin to delete products
  if (!['store_manager', 'admin'].includes(membership.role)) {
    throw new Error('You do not have permission to delete products')
  }

  // Verify the product belongs to the environment
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, environment_id')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    throw new Error('Product not found')
  }

  if (product.environment_id !== environmentId) {
    throw new Error('Product does not belong to this environment')
  }

  // Delete the product (cascade will handle related data)
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (deleteError) {
    console.error('Error deleting product:', deleteError)
    throw new Error('Failed to delete product')
  }

  revalidatePath(`/${environmentId}/products`)
  revalidatePath(`/${environmentId}`)

  return { success: true }
}

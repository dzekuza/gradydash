'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(productId: string) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Check if we're in demo mode
    const isDemoMode = !user
    
    if (userError) {
      console.error('User authentication error:', userError)
      // In demo mode, we'll continue without authentication
      if (!isDemoMode) {
        throw new Error('Authentication error: ' + userError.message)
      }
    }
    
    if (!user && !isDemoMode) {
      throw new Error('Authentication required')
    }

    console.log('Deleting product:', productId)

    // Delete only if the product belongs to an environment where the user has appropriate permissions
    // The RLS policy "Staff can modify products" will enforce environment-based access control
    const { data: deleted, error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id, environment_id')
      .single()

    if (deleteError) {
      // PGRST116 => No rows found when using .single()
      if ((deleteError as any).code === 'PGRST116') {
        throw new Error('Product not found or you do not have permission to delete it')
      }
      console.error('Error deleting product:', deleteError)
      throw new Error('Failed to delete product')
    }

    console.log('Product deleted successfully:', productId)

    // Revalidate the products page
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

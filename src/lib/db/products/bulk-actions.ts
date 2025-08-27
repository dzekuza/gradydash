'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function bulkUpdateProductStatus(
  productIds: string[], 
  newStatus: string, 
  environmentSlug: string
) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication required')
    }


    // Update all products with the new status
    const { error: updateError } = await supabase
      .from('products')
      .update({
        status: newStatus,
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', productIds)

    if (updateError) {
      console.error('Error bulk updating products:', updateError)
      throw new Error('Failed to update products: ' + updateError.message)
    }


    // Build base path for revalidation
    const basePath = `/${environmentSlug}`
    
    // Revalidate paths for immediate UI updates
    revalidatePath(`${basePath}/products`)
    revalidatePath(basePath)

    return { success: true, updatedCount: productIds.length }
  } catch (error) {
    console.error('Error in bulkUpdateProductStatus:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while updating products')
  }
}

export async function bulkDeleteProducts(
  productIds: string[], 
  environmentSlug: string
) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication required')
    }


    // Delete all products
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)

    if (deleteError) {
      console.error('Error bulk deleting products:', deleteError)
      throw new Error('Failed to delete products: ' + deleteError.message)
    }


    // Build base path for revalidation
    const basePath = `/${environmentSlug}`
    
    // Revalidate paths for immediate UI updates
    revalidatePath(`${basePath}/products`)
    revalidatePath(basePath)

    return { success: true, deletedCount: productIds.length }
  } catch (error) {
    console.error('Error in bulkDeleteProducts:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while deleting products')
  }
}

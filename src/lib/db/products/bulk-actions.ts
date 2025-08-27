'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ProductStatus } from '@/types/db'
import { CACHE_TAGS } from '@/lib/utils/cache'

interface BulkActionData {
  productIds: string[]
  status?: ProductStatus
  tags?: string[]
  categories?: string[]
}

export async function bulkUpdateStatus(data: BulkActionData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    const { productIds, status } = data

    if (!status) {
      throw new Error('Status is required')
    }

    // Update products status
    const { error: updateError } = await supabase
      .from('products')
      .update({
        status,
        status_updated_at: new Date().toISOString()
      })
      .in('id', productIds)

    if (updateError) {
      console.error('Error updating product status:', updateError)
      throw new Error('Failed to update product status')
    }

    // Add status history entries
    const statusHistoryEntries = productIds.map(productId => ({
      product_id: productId,
      from_status: 'taken', // We don't know the previous status, so defaulting
      to_status: status,
      changed_by: user.id,
      note: 'Bulk status update'
    }))

    const { error: historyError } = await supabase
      .from('product_status_history')
      .insert(statusHistoryEntries)

    if (historyError) {
      console.error('Error creating status history:', historyError)
      // Don't throw error here as the main update succeeded
    }

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    return { success: true, count: productIds.length }
  } catch (error) {
    console.error('Error in bulkUpdateStatus:', error)
    throw error
  }
}

export async function bulkUpdateTags(data: BulkActionData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    const { productIds, tags } = data

    if (!tags) {
      throw new Error('Tags are required')
    }

    // Update products tags
    const { error: updateError } = await supabase
      .from('products')
      .update({
        tags,
        updated_at: new Date().toISOString()
      })
      .in('id', productIds)

    if (updateError) {
      console.error('Error updating product tags:', updateError)
      throw new Error('Failed to update product tags')
    }

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    return { success: true, count: productIds.length }
  } catch (error) {
    console.error('Error in bulkUpdateTags:', error)
    throw error
  }
}

export async function bulkUpdateCategories(data: BulkActionData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    const { productIds, categories } = data

    if (!categories) {
      throw new Error('Categories are required')
    }

    // Update products categories
    const { error: updateError } = await supabase
      .from('products')
      .update({
        categories,
        updated_at: new Date().toISOString()
      })
      .in('id', productIds)

    if (updateError) {
      console.error('Error updating product categories:', updateError)
      throw new Error('Failed to update product categories')
    }

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    return { success: true, count: productIds.length }
  } catch (error) {
    console.error('Error in bulkUpdateCategories:', error)
    throw error
  }
}

export async function bulkDeleteProducts(data: BulkActionData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    const { productIds } = data

    // Check if user has permission to delete products
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .in('environment_id', (
        await supabase
          .from('products')
          .select('environment_id')
          .in('id', productIds)
          .limit(1)
      ).data?.[0]?.environment_id)

    if (membershipError || !memberships?.length) {
      throw new Error('You do not have permission to delete products')
    }

    // Only allow reseller_manager and above to delete products
    if (!['reseller_manager', 'grady_staff', 'grady_admin'].includes(memberships[0].role)) {
      throw new Error('You do not have permission to delete products')
    }

    // Delete products (this will cascade to related records due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('id', productIds)

    if (deleteError) {
      console.error('Error deleting products:', deleteError)
      throw new Error('Failed to delete products')
    }

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.PRODUCTS)
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/products')
    return { success: true, count: productIds.length }
  } catch (error) {
    console.error('Error in bulkDeleteProducts:', error)
    throw error
  }
}

export async function handleBulkAction(action: string, data: BulkActionData) {
  switch (action) {
    case 'updateStatus':
      return await bulkUpdateStatus(data)
    case 'updateTags':
      return await bulkUpdateTags(data)
    case 'updateCategories':
      return await bulkUpdateCategories(data)
    case 'delete':
      return await bulkDeleteProducts(data)
    default:
      throw new Error(`Unknown bulk action: ${action}`)
  }
}

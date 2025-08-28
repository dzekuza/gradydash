'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function uploadProductImages(productId: string, files: File[]) {
  const supabase = createClient()

  try {
    console.log('[Upload] Starting upload for product:', productId)
    console.log('[Upload] File count:', files.length)
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('[Upload] Auth error:', userError)
      throw new Error('Authentication required')
    }
    
    console.log('[Upload] User authenticated:', user.id)

    // Verify user has access to the product and get partner information
    console.log('[Upload] Fetching product and partner info for product:', productId)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        partner_id,
        partners!inner(
          id,
          name,
          slug
        )
      `)
      .eq('id', productId)
      .single()

    if (productError) {
      console.error('[Upload] Product fetch error:', productError)
      throw new Error('Product not found or access denied')
    }
    
    if (!product) {
      console.error('[Upload] Product not found')
      throw new Error('Product not found or access denied')
    }
    
    console.log('[Upload] Product found:', {
      id: product.id,
      title: product.title,
      partner_id: product.partner_id,
      partner: product.partners
    })

    // Verify user has membership in the partner
    console.log('[Upload] Checking membership for partner:', product.partner_id)
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('partner_id', product.partner_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError) {
      console.error('[Upload] Membership error:', membershipError)
      throw new Error('Access denied: You do not have permission to upload images for this product')
    }
    
    if (!membership) {
      console.error('[Upload] No membership found')
      throw new Error('Access denied: You do not have permission to upload images for this product')
    }
    
    console.log('[Upload] Membership verified:', membership.role)

    const uploadedImages = []

    for (const file of files) {
      console.log('[Upload] Processing file:', file.name)
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `product-images/${fileName}`
      
      console.log('[Upload] Generated file path:', filePath)

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('[Upload] Storage upload error:', uploadError)
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }
      
      console.log('[Upload] File uploaded to storage:', uploadData)

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
        
      console.log('[Upload] Got public URL:', urlData.publicUrl)

      // Save image metadata to database
      const imageMetadata = {
        product_id: productId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user.id
      }
      
      console.log('[Upload] Saving image metadata:', imageMetadata)
      
      const { data: imageData, error: dbError } = await supabase
        .from('product_images')
        .insert(imageMetadata)
        .select()
        .single()

      if (dbError) {
        console.error('[Upload] Database insert error:', dbError)
        // Try to delete the uploaded file if database insert fails
        await supabase.storage
          .from('product-images')
          .remove([filePath])
        throw new Error(`Failed to save image metadata for ${file.name}: ${dbError.message}`)
      }
      
      console.log('[Upload] Image metadata saved:', imageData)

      uploadedImages.push({
        ...imageData,
        public_url: urlData.publicUrl
      })
        }
    
    console.log('[Upload] Upload completed successfully:', uploadedImages.length, 'images')
    return { success: true, images: uploadedImages }
  } catch (error) {
    console.error('[Upload] Error uploading product images:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to upload images')
  }
}

export async function deleteProductImage(imageId: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get image data with product and partner information
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select(`
        *,
        products!inner(
          id,
          partner_id,
          partners!inner(
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      throw new Error('Image not found')
    }

    // Verify user has membership in the partner
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('partner_id', image.products.partner_id)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      throw new Error('Access denied: You do not have permission to delete this image')
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([image.file_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      throw new Error(`Failed to delete image: ${dbError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting product image:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to delete image')
  }
}

'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function uploadProductImages(productId: string, files: File[]) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    const uploadedImages = []

    for (const file of files) {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // Save image metadata to database
      const { data: imageData, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: user.id
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        // Try to delete the uploaded file if database insert fails
        await supabase.storage
          .from('product-images')
          .remove([filePath])
        throw new Error(`Failed to save image metadata for ${file.name}: ${dbError.message}`)
      }

      uploadedImages.push({
        ...imageData,
        public_url: urlData.publicUrl
      })
    }

    return { success: true, images: uploadedImages }
  } catch (error) {
    console.error('Error uploading product images:', error)
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

    // Get image data
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      throw new Error('Image not found')
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

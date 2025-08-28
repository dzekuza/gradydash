'use server'

import { createClient } from '@/lib/supabase/client-server'
import { ProductImage } from '@/types/db'

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching product images:', error)
      return []
    }

    // Add public URLs to the images
    const imagesWithUrls = (data || []).map(image => ({
      ...image,
      public_url: supabase.storage
        .from('product-images')
        .getPublicUrl(image.file_path).data.publicUrl
    }))

    return imagesWithUrls
  } catch (error) {
    console.error('Unexpected error in getProductImages:', error)
    return []
  }
}

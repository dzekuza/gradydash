import { createClient } from '@/lib/supabase/client-server'
import { ProductImage } from '@/types/db'

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = createClient()

  try {
    // Get images from database
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching product images:', error)
      return []
    }

    // Add public URLs to each image
    const imagesWithUrls = images.map(image => {
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(image.file_path)

      return {
        ...image,
        public_url: urlData.publicUrl
      }
    })

    return imagesWithUrls
  } catch (error) {
    console.error('Error in getProductImages:', error)
    return []
  }
}

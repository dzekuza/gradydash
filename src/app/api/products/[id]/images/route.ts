import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const productId = params.id

    // Get images from database
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching product images:', error)
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
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

    return NextResponse.json({ images: imagesWithUrls })
  } catch (error) {
    console.error('Error in GET /api/products/[id]/images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

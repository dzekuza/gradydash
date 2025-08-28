import { NextRequest, NextResponse } from 'next/server'
import { getProductImages } from '@/lib/db/products/get-product-images'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const images = await getProductImages(productId)
    
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}

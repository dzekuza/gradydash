import { ProductImage } from '@/types/db'

export async function getProductImagesClient(productId: string): Promise<ProductImage[]> {
  try {
    const response = await fetch(`/api/products/${productId}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.images || []
  } catch (error) {
    console.error('Error fetching product images:', error)
    return []
  }
}

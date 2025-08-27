import { redirect } from 'next/navigation'

export default function ProductDetailPage() {
  // Redirect to the main products page - product details will be handled via dialog
  redirect('/products')
}

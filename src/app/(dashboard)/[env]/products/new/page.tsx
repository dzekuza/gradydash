import { redirect } from 'next/navigation'

export default function NewProductPage() {
  // Redirect to the main products page - the "New Product" dialog will be handled there
  redirect('/products')
}

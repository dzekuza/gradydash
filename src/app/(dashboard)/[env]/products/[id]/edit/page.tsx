import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { getProducts } from '@/lib/db/products/get-products'
import { getLocations } from '@/lib/db/locations/get-locations'
import { ProductForm } from '@/components/product/product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductEditPageProps {
  params: {
    env: string
    id: string
  }
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Get environment
  const environment = await getEnvironmentBySlug(params.env)
  if (!environment) {
    redirect('/dashboard')
  }

  // Get the product
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('environment_id', environment.id)
    .single()

  if (productsError || !products) {
    redirect(`/${params.env}/products`)
  }

  // Get locations for the form
  const locations = await getLocations(environment.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">
            Update product information and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Update the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            product={products}
            locations={locations}
            environmentId={environment.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}

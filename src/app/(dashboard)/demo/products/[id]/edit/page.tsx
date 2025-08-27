import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/product/product-form'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { createClient } from '@/lib/supabase/client-server'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient()
  
  // Get the demo environment ID
  const demoEnvironmentId = await getDemoEnvironmentId()
  
  // Fetch the product
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      environment_id,
      title,
      sku,
      barcode,
      description,
      status,
      location_id,
      purchase_price,
      selling_price,
      sold_price,
      sold_at,
      status_updated_at,
      created_at,
      updated_at
    `)
    .eq('id', params.id)
    .eq('environment_id', demoEnvironmentId)
    .single()

  if (error || !product) {
    notFound()
  }
  
  // Fetch locations for the demo environment
  const locations = await getLocations(demoEnvironmentId)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div>
      
      <ProductForm 
        product={product}
        locations={locations}
        environmentId={demoEnvironmentId}
      />
    </div>
  )
}

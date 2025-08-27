import { ProductForm } from '@/components/product/product-form'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'

export default async function NewProductPage() {
  // Get the demo environment ID
  const demoEnvironmentId = await getDemoEnvironmentId()
  
  // Fetch locations for the demo environment
  const locations = await getLocations(demoEnvironmentId)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
      </div>
      
      <ProductForm 
        locations={locations}
        environmentId={demoEnvironmentId}
      />
    </div>
  )
}

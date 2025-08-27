import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getProducts } from '@/lib/db/products/get-products'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { getLocations } from '@/lib/db/locations/get-locations'
import { ImportProductsDialog } from '@/components/product/import-products-dialog'
import { ProductDialog } from '@/components/product/product-dialog'
import { ProductsTableWrapper } from '@/components/product/products-table-wrapper'

export default async function DemoProductsPage() {
  // Get the demo environment ID
  const demoEnvironmentId = await getDemoEnvironmentId()
  
  // Fetch products and locations for the demo environment
  const [products, locations] = await Promise.all([
    getProducts(demoEnvironmentId),
    getLocations(demoEnvironmentId)
  ])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <ImportProductsDialog environmentId={demoEnvironmentId} />
          <ProductDialog locations={locations} environmentId={demoEnvironmentId} />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Product Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage products for the demo environment. You can add, edit, and track the status of products here.
            </p>
          </div>
        </div>
        
        <ProductsTableWrapper products={products} />
      </div>
    </div>
  )
}

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getProducts } from '@/lib/db/products/get-products'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { ImportProductsDialog } from '@/components/product/import-products-dialog'
import { ProductDialog } from '@/components/product/product-dialog'
import { DataTable } from '@/components/data-table/data-table'
import { columns } from '@/components/data-table/data'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface ProductsPageProps {
  params: { env: string }
}

async function ProductsContent({ environmentSlug }: { environmentSlug: string }) {
  const supabase = createClient()

  // Get the environment
  const environment = await getEnvironmentBySlug(environmentSlug)
  if (!environment) {
    notFound()
  }

  // Get current user's membership to check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('environment_id', environment.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Check if user can manage products
  const canManageProducts = ['reseller_manager', 'grady_staff', 'grady_admin'].includes(membership.role)

  // Fetch products and locations for the environment
  const [products, locations] = await Promise.all([
    getProducts(environment.id),
    getLocations(environment.id)
  ])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        {canManageProducts && (
          <div className="flex items-center space-x-2">
            <ImportProductsDialog environmentId={environment.id} />
            <ProductDialog locations={locations} environmentId={environment.id} />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Product Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage products for {environment.name}. You can add, edit, and track the status of products here.
            </p>
          </div>
        </div>
        
        <DataTable columns={columns} data={products} />
      </div>
    </div>
  )
}

function ProductsSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function ProductsPage({ params }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent environmentSlug={params.env} />
    </Suspense>
  )
}

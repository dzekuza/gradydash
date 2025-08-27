import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { getProducts } from '@/lib/db/products/get-products'
import { getDashboardStats } from '@/lib/db/products/get-dashboard-stats'
import { getUserMembership } from '@/lib/db/environments/get-user-membership'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { getLocations } from '@/lib/db/locations/get-locations'
import { ProductsTableWrapper } from '@/components/product/products-table-wrapper'
import { ProductDialog } from '@/components/product/product-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

interface ProductsPageProps {
  params: {
    env: string
  }
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get the environment by slug
  const environment = await getEnvironmentBySlug(params.env)
  if (!environment) {
    redirect('/dashboard')
  }

  // Get user's membership in this environment
  const membership = await getUserMembership(user.id, params.env)
  
  if (!membership) {
    redirect('/dashboard')
  }

  // Get products, stats, and locations using environment ID
  const [products, stats, locations] = await Promise.all([
    getProducts(environment.id),
    getDashboardStats(environment.id),
    getLocations(environment.id)
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sold':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'selling':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'in_repair':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'returned':
      case 'discarded':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and track their status
          </p>
        </div>
        <ProductDialog 
          locations={locations} 
          environmentId={environment.id}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Selling</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sellingCount}</div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Sale</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTimeToSale}d</div>
            <p className="text-xs text-muted-foreground">
              Days on average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(stats.statusDistribution).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {status.replace('_', ' ')}
              </CardTitle>
              {getStatusIcon(status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">
                {((count / stats.totalProducts) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            View and manage all products in this environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTableWrapper 
            products={products} 
            environmentSlug={params.env}
          />
        </CardContent>
      </Card>
    </div>
  )
}

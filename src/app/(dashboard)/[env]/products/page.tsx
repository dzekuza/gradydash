import { redirect } from 'next/navigation'
import { getProducts } from '@/lib/db/products/get-products'
import { getDashboardStats } from '@/lib/db/products/get-dashboard-stats'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getLocationById } from '@/lib/db/locations/get-location-by-id'
import { ProductsTableWrapper } from '@/components/product/products-table-wrapper'
import { ProductDialog } from '@/components/product/product-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  X
} from 'lucide-react'
import Link from 'next/link'

interface ProductsPageProps {
  params: {
    env: string
  }
  searchParams: {
    location?: string
  }
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  // Get the environment by slug (access already checked in layout)
  const environment = await getEnvironmentBySlug(params.env)
  if (!environment) {
    redirect('/dashboard')
  }

  // Get products, stats, and locations using environment ID
  const [allProducts, stats, locations] = await Promise.all([
    getProducts(environment.id),
    getDashboardStats(environment.id),
    getLocations(environment.id)
  ])

  // Filter products by location if specified
  let products = allProducts
  let locationFilter = null
  
  if (searchParams.location) {
    locationFilter = await getLocationById(searchParams.location)
    if (locationFilter) {
      products = allProducts.filter(product => product.location_id === searchParams.location)
    }
  }

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
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and track their status
          </p>
          {locationFilter && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Filtered by: {locationFilter.name}
              </Badge>
              <Link href={`/${params.env}/products`}>
                <Button variant="ghost" size="sm">
                  <X className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationFilter ? products.length : stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {locationFilter ? 'In this location' : 'In inventory'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Selling</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locationFilter 
                ? products.filter(p => p.status === 'selling').length 
                : stats.sellingCount
              }
            </div>
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
            <div className="text-2xl font-bold">
              €{locationFilter 
                ? products
                    .filter(p => p.status === 'sold' && p.sold_price)
                    .reduce((sum, p) => sum + (p.sold_price || 0), 0)
                    .toFixed(2)
                : stats.totalRevenue.toFixed(2)
              }
            </div>
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
            <div className="text-2xl font-bold">
              {locationFilter 
                ? 'N/A' // Would need to calculate for filtered products
                : stats.avgTimeToSale.toFixed(1) + 'd'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average days to sell
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            {locationFilter 
              ? `Products at ${locationFilter.name}`
              : 'All products in your inventory'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTableWrapper 
            products={products} 
            environmentSlug={params.env}
            actionButtons={
              <ProductDialog 
                locations={locations} 
                environmentId={environment.id}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Clock, 
  MapPin,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { getProductsByStatus, getRevenueLast30Days, getAverageTimeToSale } from '@/lib/db/products/get-dashboard-stats'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getLocationStats } from '@/lib/db/locations/get-location-stats'
import { getProducts } from '@/lib/db/products/get-products'
import { createClient } from '@/lib/supabase/client-server'

async function AnalyticsStats() {
  const demoEnvironmentId = await getDemoEnvironmentId()
  const [statusCounts, revenue, avgTimeToSale, locations, locationStats, products] = await Promise.all([
    getProductsByStatus(demoEnvironmentId),
    getRevenueLast30Days(demoEnvironmentId),
    getAverageTimeToSale(demoEnvironmentId),
    getLocations(demoEnvironmentId),
    getLocationStats(demoEnvironmentId),
    getProducts(demoEnvironmentId)
  ])

  const totalProducts = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
  const activeProducts = statusCounts.selling + statusCounts.in_repair
  const soldProducts = statusCounts.sold

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Selling or in repair
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Sale</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeToSale.toFixed(1)}d</div>
            <p className="text-xs text-muted-foreground">
              Average days to sell
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Product Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of products by current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    status === 'selling' ? 'default' :
                    status === 'sold' ? 'secondary' :
                    status === 'in_repair' ? 'outline' :
                    'secondary'
                  }>
                    {status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Overview
            </CardTitle>
            <CardDescription>
              Products distributed across locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {locationStats.length > 0 ? (
              <div className="space-y-3">
                {locationStats.map((location) => (
                  <div key={location.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{location.name}</span>
                    <Badge variant="outline">{location.productCount} products</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No locations created yet. Create locations to organize your products.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest product updates and sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {product.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {product.selling_price ? `€${product.selling_price}` : 'No price'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No products found. Add some products to see activity here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DemoAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>
      
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <AnalyticsStats />
      </Suspense>
    </div>
  )
}

import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProductsByStatus, getRevenueLast30Days, getAverageTimeToSale } from '@/lib/db/products/get-dashboard-stats'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { getProducts } from '@/lib/db/products/get-products'
import { DataTable } from '@/components/data-table/data-table'
import { columns } from '@/components/data-table/data'

export default async function DemoPage() {
  const cookieStore = cookies()
  
  // Get the demo environment ID
  const demoEnvironmentId = await getDemoEnvironmentId(cookieStore)
  
  // Initialize fallback defaults
  let productStats = {
    taken: 0,
    in_repair: 0,
    selling: 0,
    sold: 0,
    returned: 0,
    discarded: 0
  }
  let revenue = 0
  let avgTimeToSale = 0
  let products: any[] = []

  // Fetch real data from the database with error handling
  try {
    const [productStatsResult, revenueResult, avgTimeToSaleResult, productsResult] = await Promise.all([
      getProductsByStatus(demoEnvironmentId, cookieStore),
      getRevenueLast30Days(demoEnvironmentId, cookieStore),
      getAverageTimeToSale(demoEnvironmentId, cookieStore),
      getProducts(demoEnvironmentId, cookieStore),
    ])

    // Assign results to variables
    productStats = productStatsResult || productStats
    revenue = revenueResult || 0
    avgTimeToSale = avgTimeToSaleResult || 0
    products = productsResult || []
  } catch (error) {
    // Log the error with context
    console.error('Failed to fetch dashboard data for demo environment:', {
      environmentId: demoEnvironmentId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    // Continue with fallback defaults - the page will render with zero values
    // rather than crashing the entire application
  }

  const totalProducts = Object.values(productStats).reduce((sum, count) => sum + count, 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
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
            <CardTitle className="text-sm font-medium">In Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.in_repair}</div>
            <p className="text-xs text-muted-foreground">
              Products being repaired
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Number(revenue ?? 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(avgTimeToSale ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Days on average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Product Status Overview</CardTitle>
            <CardDescription>
              Distribution of products by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Taken</span>
                <span className="font-medium">{productStats.taken}</span>
              </div>
              <div className="flex justify-between">
                <span>In Repair</span>
                <span className="font-medium">{productStats.in_repair}</span>
              </div>
              <div className="flex justify-between">
                <span>Selling</span>
                <span className="font-medium">{productStats.selling}</span>
              </div>
              <div className="flex justify-between">
                <span>Sold</span>
                <span className="font-medium">{productStats.sold}</span>
              </div>
              <div className="flex justify-between">
                <span>Returned</span>
                <span className="font-medium">{productStats.returned}</span>
              </div>
              <div className="flex justify-between">
                <span>Discarded</span>
                <span className="font-medium">{productStats.discarded}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {productStats.selling} products currently selling
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active listings
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    €{Number(revenue ?? 0).toFixed(2)} revenue — last 30 days
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From {productStats.sold} sold products in the last 30 days
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Data Table - Unwrapped */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Products</h3>
            <p className="text-sm text-muted-foreground">
              Manage your product inventory with filtering, sorting, and bulk actions
            </p>
          </div>
        </div>
        <DataTable columns={columns} data={products} />
      </div>
    </div>
  )
}

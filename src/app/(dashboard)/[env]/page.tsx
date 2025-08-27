import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getProductsByStatus, getRevenueLast30Days, getAverageTimeToSale } from '@/lib/db/products/get-dashboard-stats'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'

interface DashboardPageProps {
  params: { env: string }
}

async function DashboardStats({ environmentId }: { environmentId: string }) {
  const [productsByStatus, revenue, avgTimeToSale] = await Promise.all([
    getProductsByStatus(environmentId),
    getRevenueLast30Days(environmentId),
    getAverageTimeToSale(environmentId),
  ])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.values(productsByStatus).reduce((sum, count) => sum + count, 0)}
          </div>
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
          <div className="text-2xl font-bold">{productsByStatus.in_repair || 0}</div>
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
          <div className="text-2xl font-bold">€{revenue.toFixed(2)}</div>
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
          <div className="text-2xl font-bold">{avgTimeToSale.toFixed(1)}d</div>
          <p className="text-xs text-muted-foreground">
            Average days to sell
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // Get environment from slug
  const environment = await getEnvironmentBySlug(params.env)
  
  if (!environment) {
    throw new Error('Environment not found')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats environmentId={environment.id} />
      </Suspense>
    </div>
  )
}

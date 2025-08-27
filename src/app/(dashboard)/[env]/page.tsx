import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { getDashboardStats } from '@/lib/db/products/get-dashboard-stats'
import { AccessDenied } from '@/components/auth/access-denied'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, TrendingUp, DollarSign, Clock } from 'lucide-react'

interface EnvironmentDashboardPageProps {
  params: { env: string }
}

async function EnvironmentStats({ environmentId }: { environmentId: string }) {
  try {
    const stats = await getDashboardStats(environmentId)
    
    const {
      totalProducts,
      statusDistribution,
      totalRevenue,
      avgTimeToSale
    } = stats

    const productsInRepair = statusDistribution.in_repair || 0

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Repair</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsInRepair}</div>
            <p className="text-xs text-muted-foreground">
              Products being repaired
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
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
    )
  } catch (error) {
    console.error('Error loading environment stats:', error)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Loading Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Unable to load dashboard statistics. Please try refreshing the page.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

function EnvironmentStatsSkeleton() {
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

export default async function EnvironmentDashboardPage({ params }: EnvironmentDashboardPageProps) {
  try {
    const user = await getUser()
    
    if (!user) {
      redirect('/login')
    }

    // Get user routing information
    const routingInfo = await getUserRoutingInfo(user.id)
    
    // Check if user has access to this environment
    // System admins have access to all environments
    // Regular users need to have a membership in this environment
    const hasAccess = routingInfo.isSystemAdmin || 
      (routingInfo.hasEnvironments && routingInfo.firstEnvironmentSlug === params.env)

    if (!hasAccess) {
      return (
        <AccessDenied
          title="Access Denied"
          message={`You don't have permission to access the "${params.env}" environment.`}
          homeUrl={routingInfo.redirectTo}
        />
      )
    }

    // Get environment from slug (user has access, so RLS will allow it)
    const environment = await getEnvironmentBySlug(params.env)
    
    if (!environment) {
      return (
        <AccessDenied
          title="Environment Not Found"
          message="The environment you're trying to access does not exist."
          homeUrl="/dashboard"
        />
      )
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Environment Dashboard</h2>
        </div>
        <Suspense fallback={<EnvironmentStatsSkeleton />}>
          <EnvironmentStats environmentId={environment.id} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error in environment dashboard page:', error)
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Error</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              An error occurred while loading the dashboard. Please try refreshing the page.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { AccessDenied } from '@/components/auth/access-denied'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateEnvironmentDialog } from '@/components/admin/create-environment-dialog'
import { Building2, Users, Calendar, Mail, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminEnvironmentsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Use service client for admin operations to bypass RLS
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get user routing information
  const routingInfo = await getUserRoutingInfo(user.id)
  
  // Check if user can access admin panel
  if (!routingInfo.isSystemAdmin) {
    return (
      <AccessDenied
        title="Admin Access Required"
        message="You need administrator privileges to access this page."
        homeUrl={routingInfo.redirectTo}
      />
    )
  }

  // Get all environments with member counts using service client
  const { data: environments, error: envError } = await serviceClient
    .from('environments')
    .select(`
      id,
      name,
      slug,
      description,
      created_at,
      updated_at,
      memberships (
        id,
        role,
        profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (envError) {
    console.error('Error fetching environments:', envError)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Environment Management</h2>
          <p className="text-muted-foreground">
            Manage all environments and their settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateEnvironmentDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Environments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{environments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active environments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {environments?.reduce((total, env) => total + (env.memberships?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all environments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {environments && environments.length > 0 
                ? Math.round(environments.reduce((total, env) => total + (env.memberships?.length || 0), 0) / environments.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per environment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Environments</CardTitle>
          <CardDescription>
            View and manage all environments in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {environments?.map((environment) => {
              const memberCount = environment.memberships?.length || 0
              const adminCount = environment.memberships?.filter(m => m.role === 'admin').length || 0
              const managerCount = environment.memberships?.filter(m => m.role === 'store_manager').length || 0

              return (
                <div key={environment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{environment.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {environment.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>Slug: {environment.slug}</span>
                          <span>Created: {formatDistanceToNow(new Date(environment.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{memberCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>{adminCount} admin</span>
                        <span>•</span>
                        <span>{managerCount} manager</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/${environment.slug}`}>
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {(!environments || environments.length === 0) && (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No environments yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first environment to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

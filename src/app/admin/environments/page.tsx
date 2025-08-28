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

export default async function AdminPartnersPage() {
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

  // Get partners created by this admin user
  const { data: partners, error: partnersError } = await serviceClient
    .from('partners')
    .select(`
      id,
      name,
      slug,
      description,
      created_at,
      updated_at,
      created_by,
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
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (partnersError) {
    console.error('Error fetching partners:', partnersError)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Partners</h2>
          <p className="text-muted-foreground">
            Manage partners you have created
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateEnvironmentDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Your partners
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
              {partners?.reduce((total, partner) => total + (partner.memberships?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across your partners
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
              {partners && partners.length > 0 
                ? Math.round(partners.reduce((total, partner) => total + (partner.memberships?.length || 0), 0) / partners.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per your partner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      <Card>
        <CardHeader>
          <CardTitle>My Partners</CardTitle>
          <CardDescription>
            View and manage partners you have created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partners?.map((partner) => (
              <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {partner.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" asChild>
                  <a href={`/${partner.slug}`}>
                    View
                  </a>
                </Button>
              </div>
            ))}
            
            {(!partners || partners.length === 0) && (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No partners yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first partner to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

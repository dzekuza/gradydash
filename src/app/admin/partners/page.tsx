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
import Image from 'next/image'

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

  // Get all partners with member counts using service client
  const { data: partners, error: partnersError } = await serviceClient
    .from('partners')
    .select(`
      id,
      name,
      slug,
      description,
      logo_url,
      logo_file_name,
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

  if (partnersError) {
    console.error('Error fetching partners:', partnersError)
  }

  return (
    <div className="flex-1 space-y-4 px-0 md:px-8 py-4 md:py-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Partner Management</h2>
          <p className="text-muted-foreground">
            Manage all partners and their settings
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
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
              Active partners
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
              Across all partners
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
              Per partner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partners Grid */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">All Partners</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all partners in the system
          </p>
          <div className="mt-4 md:hidden">
            <CreateEnvironmentDialog />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {partners?.map((partner) => {
            const memberCount = partner.memberships?.length || 0
            const adminCount = partner.memberships?.filter(m => m.role === 'admin').length || 0
            const managerCount = partner.memberships?.filter(m => m.role === 'store_manager').length || 0

            return (
              <Card key={partner.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Logo and Name */}
                    <div className="flex items-center gap-3">
                      {partner.logo_url ? (
                        <Image
                          src={partner.logo_url}
                          alt={`${partner.name} logo`}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{partner.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {partner.description || 'No description'}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{memberCount} members</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {adminCount} admin • {managerCount} manager
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Slug:</span>
                        <code className="bg-muted px-1 rounded text-xs">{partner.slug}</code>
                      </div>
                      <div>
                        Created {formatDistanceToNow(new Date(partner.created_at), { addSuffix: true })}
                      </div>
                    </div>

                    {/* Action */}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={`/${partner.slug}`}>
                        View Dashboard
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {(!partners || partners.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No partners yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first partner to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  BarChart3, 
  Shield,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Check if user is a system admin
  const adminStatus = await getUserAdminStatus(user.id)
  
  if (!adminStatus.isSystemAdmin) {
    redirect('/dashboard')
  }

  // Get all environments
  const { data: environments, error: envError } = await supabase
    .from('environments')
    .select(`
      id,
      name,
      slug,
      description,
      created_at,
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

  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      created_at,
      memberships (
        id,
        role,
        environment_id,
        environments (
          id,
          name,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false })

  // Get system stats
  const totalEnvironments = environments?.length || 0
  const totalUsers = users?.length || 0
  const activeEnvironments = environments?.filter(env => 
    env.memberships && env.memberships.length > 0
  ).length || 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            System-wide administration for Grady ReSellOps
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {adminStatus.role === 'grady_admin' ? 'Master Admin' : 'Staff Admin'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Environments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnvironments}</div>
            <p className="text-xs text-muted-foreground">
              {activeEnvironments} active environments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users across all environments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/environments">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Manage Environments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create, edit, and manage all environments
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/users">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View and manage user accounts
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/invites">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Send Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Invite new users to environments
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/admin/settings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure system-wide settings
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Environments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Environments
            <Link href="/admin/environments">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardTitle>
          <CardDescription>
            Recently created environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {environments?.slice(0, 5).map((environment) => (
              <div key={environment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{environment.name}</h4>
                  <p className="text-sm text-muted-foreground">{environment.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {environment.memberships?.length || 0} members
                  </p>
                </div>
                <Link href={`/${environment.slug}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
            {(!environments || environments.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No environments found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Users
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardTitle>
          <CardDescription>
            Recently registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users?.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{user.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.memberships?.length || 0} memberships
                  </p>
                </div>
                <Link href={`/admin/users/${user.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No users found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

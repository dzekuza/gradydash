import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar, 
  Building2, 
  Shield, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react'

export default async function AdminUsersPage() {
  // Use the server client for authentication and admin operations
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  const adminStatus = await getUserAdminStatus(user.id)
  
  if (!adminStatus.isSystemAdmin) {
    redirect('/dashboard')
  }

  // Get all users with their memberships using service role client for admin operations
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      updated_at,
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

  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  // Calculate statistics
  const totalUsers = users?.length || 0
  const totalMemberships = users?.reduce((total, user) => total + (user.memberships?.length || 0), 0) || 0
  const avgMemberships = totalUsers > 0 ? Math.round(totalMemberships / totalUsers) : 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage all users and their environment memberships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memberships</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMemberships}</div>
            <p className="text-xs text-muted-foreground">
              Environment memberships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Memberships</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMemberships}</div>
            <p className="text-xs text-muted-foreground">
              Per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage users and their environment access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{user.full_name || 'No name'}</h3>
                    <Badge variant="outline">{user.email}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {user.memberships?.length || 0} environments
                    </span>
                  </div>
                  {user.memberships && user.memberships.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.memberships.map((membership) => (
                        <Badge key={membership.id} variant="secondary" className="text-xs">
                          {(membership.environments as any)?.name || 'Unknown'} ({membership.role})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No users</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by inviting your first user.
                </p>
                <div className="mt-6">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

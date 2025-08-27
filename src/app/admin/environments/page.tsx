import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  Plus, 
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminEnvironmentsPage() {
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

  // Get all environments with member counts
  const { data: environments, error: envError } = await supabase
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Environment
          </Button>
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
            Manage environments and their members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {environments?.map((environment) => (
              <div key={environment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{environment.name}</h3>
                    <Badge variant="outline">{environment.slug}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {environment.description || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {environment.memberships?.length || 0} members
                    </span>
                    <span>
                      Created {new Date(environment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/${environment.slug}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {(!environments || environments.length === 0) && (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No environments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating your first environment.
                </p>
                <div className="mt-6">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Environment
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

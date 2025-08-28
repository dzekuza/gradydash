'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-browser'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Building2, 
  Calendar, 
  Mail, 
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserWithMemberships {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
  memberships: {
    id: string
    role: string
    partner_id: string | null
    user_id: string
    created_at: string
    updated_at: string
    partners: {
      id: string
      name: string
      slug: string
      created_at: string
      updated_at: string
    } | null
  }[]
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserWithMemberships[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        
        // Check authentication
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Check admin status
        const adminStatus = await getUserAdminStatus(currentUser.id)
        
        if (!adminStatus.isSystemAdmin) {
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)

        // Use service client for admin operations to bypass RLS
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Get all users with their memberships using service role client for admin operations
        const { data: allUsers, error: usersError } = await serviceClient
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
              partner_id,
              user_id,
              created_at,
              updated_at,
              partners (
                id,
                name,
                slug,
                created_at,
                updated_at
              )
            )
          `)
          .order('created_at', { ascending: false })

        if (usersError) {
          console.error('Error fetching users:', usersError)
        } else {
          // Transform the data to match our interface
          const transformedUsers: UserWithMemberships[] = (allUsers || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            created_at: user.created_at,
            updated_at: user.updated_at,
            memberships: (user.memberships || []).map((membership: any) => ({
              id: membership.id,
              role: membership.role,
              partner_id: membership.partner_id,
              user_id: membership.user_id,
              created_at: membership.created_at,
              updated_at: membership.updated_at,
              partners: membership.partners?.[0] || null
            }))
          }))
          setUsers(transformedUsers)
        }

      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  // Calculate statistics
  const totalUsers = users.length
  const totalMemberships = users.reduce((total, user) => total + (user.memberships?.length || 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage all users and their partner memberships
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
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
              Partner memberships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            View users and their partner access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
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
                      {user.memberships?.length || 0} partners
                    </span>
                  </div>
                  {user.memberships && user.memberships.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.memberships.map((membership) => (
                        <Badge key={membership.id} variant="secondary" className="text-xs">
                          {membership.partner_id === null 
                            ? 'System Admin' 
                            : membership.partners?.name || 'Unknown Partner'
                          } ({membership.role})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Shield className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No users found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isLoading ? 'Loading users...' : 'No users have been registered yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

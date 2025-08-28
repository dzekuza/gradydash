'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-browser'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { resendInvite, cancelInvite } from '@/lib/db/environments/manage-invites'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminInviteUserDialog } from '@/components/admin/admin-invite-user-dialog'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar, 
  Building2, 
  Eye, 
  Edit, 
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Environment, Membership, Profile } from '@/types/db'
import { useToast } from '@/hooks/use-toast'

interface UserWithMemberships extends Profile {
  memberships: (Membership & {
    environments: Environment
  })[]
}

interface Invite {
  id: string
  email: string
  role: string
  accepted_at: string | null
  expires_at: string
  created_at: string
  environments: {
    id: string
    name: string
    slug: string
  }[] | null
  invited_by: {
    id: string
    full_name: string
    email: string
  }[] | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [users, setUsers] = useState<UserWithMemberships[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null)
  const [isResending, setIsResending] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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

        // Get all environments for the invitation dialog
        const { data: envs, error: environmentsError } = await serviceClient
          .from('environments')
          .select('id, name, slug, created_at, updated_at')
          .order('name', { ascending: true })

        if (environmentsError) {
          console.error('Error fetching environments:', environmentsError)
        } else {
          setEnvironments((envs as Environment[]) || [])
        }

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
              environment_id,
              user_id,
              created_at,
              updated_at,
              environments (
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
              environment_id: membership.environment_id,
              user_id: membership.user_id,
              created_at: membership.created_at,
              updated_at: membership.updated_at,
              environments: membership.environments?.[0] || null
            })).filter((membership: any) => membership.environments)
          }))
          setUsers(transformedUsers)
        }

        // Get all environment invites using service role client for admin operations
        const { data: allInvites, error: invitesError } = await serviceClient
          .from('environment_invites')
          .select(`
            id,
            email,
            role,
            accepted_at,
            expires_at,
            created_at,
            environments (
              id,
              name,
              slug
            ),
            invited_by:profiles!environment_invites_invited_by_fkey (
              id,
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (invitesError) {
          console.error('Error fetching invites:', invitesError)
        } else {
          setInvites(allInvites || [])
        }

      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleResendInvite = async (inviteId: string) => {
    setIsResending(inviteId)
    try {
      await resendInvite(inviteId)
      toast({
        title: 'Invite resent',
        description: 'The invitation has been resent successfully.',
      })
      // Refresh the invites list
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: allInvites } = await serviceClient
        .from('environment_invites')
        .select(`
          id,
          email,
          role,
          accepted_at,
          expires_at,
          created_at,
          environments (
            id,
            name,
            slug
          ),
          invited_by:profiles!environment_invites_invited_by_fkey (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
      setInvites(allInvites || [])
    } catch (error) {
      console.error('Error resending invite:', error)
      toast({
        title: 'Failed to resend',
        description: error instanceof Error ? error.message : 'Failed to resend invitation',
        variant: 'destructive',
      })
    } finally {
      setIsResending(null)
    }
  }

  const handleDeleteInvite = async (inviteId: string) => {
    setIsDeleting(inviteId)
    try {
      await cancelInvite(inviteId)
      toast({
        title: 'Invite deleted',
        description: 'The invitation has been deleted successfully.',
      })
      // Refresh the invites list
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: allInvites } = await serviceClient
        .from('environment_invites')
        .select(`
          id,
          email,
          role,
          accepted_at,
          expires_at,
          created_at,
          environments (
            id,
            name,
            slug
          ),
          invited_by:profiles!environment_invites_invited_by_fkey (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
      setInvites(allInvites || [])
    } catch (error) {
      console.error('Error deleting invite:', error)
      toast({
        title: 'Failed to delete',
        description: error instanceof Error ? error.message : 'Failed to delete invitation',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return 'Less than 1h left'
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
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
  
  // Calculate invite statistics based on accepted_at and expires_at
  const now = new Date()
  const pendingInvites = invites.filter(invite => !invite.accepted_at && new Date(invite.expires_at) > now)
  const acceptedInvites = invites.filter(invite => invite.accepted_at)
  const expiredInvites = invites.filter(invite => !invite.accepted_at && new Date(invite.expires_at) <= now)
  const totalInvites = invites.length

  const getStatusBadge = (acceptedAt: string | null, expiresAt: string) => {
    const isExpired = new Date(expiresAt) <= now
    
    if (isExpired && !acceptedAt) {
      return <Badge variant="destructive">Expired</Badge>
    }
    
    if (acceptedAt) {
      return <Badge variant="secondary">Accepted</Badge>
    }
    
    return <Badge variant="default">Pending</Badge>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage all users, memberships, and invitations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <AdminInviteUserDialog environments={environments} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvites}</div>
            <p className="text-xs text-muted-foreground">
              All invitations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvites.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Users and Invites */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({totalUsers})
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({totalInvites})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage users and their environment access
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
                          {user.memberships?.length || 0} environments
                        </span>
                      </div>
                      {user.memberships && user.memberships.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.memberships.map((membership) => (
                            <Badge key={membership.id} variant="secondary" className="text-xs">
                              {membership.environments?.name || 'Unknown'} ({membership.role})
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
                      <AdminInviteUserDialog 
                        environments={environments}
                        trigger={
                          <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite
                          </Button>
                        }
                      />
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No users</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get started by inviting your first user.
                    </p>
                    <div className="mt-6">
                      <AdminInviteUserDialog environments={environments} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Invitations</CardTitle>
              <CardDescription>
                View and manage all environment invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invites.map((invite) => {
                  const timeLeft = getTimeUntilExpiry(invite.expires_at)
                  const isExpiringSoon = timeLeft.includes('h') && parseInt(timeLeft) < 24
                  
                  return (
                    <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{invite.email}</h3>
                          <Badge variant="outline">{invite.role}</Badge>
                          {getStatusBadge(invite.accepted_at, invite.expires_at)}
                          {isExpiringSoon && !invite.accepted_at && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {invite.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {invite.environments?.[0]?.name || 'Unknown Environment'}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            by {invite.invited_by?.[0]?.full_name || invite.invited_by?.[0]?.email || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(invite.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedInvite(invite)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          {selectedInvite && (
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invitation Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about this invitation
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">Email</h4>
                                  <p className="text-sm text-muted-foreground">{selectedInvite.email}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Role</h4>
                                  <p className="text-sm text-muted-foreground">{selectedInvite.role}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Environment</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedInvite.environments?.[0]?.name || 'Unknown Environment'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Invited By</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedInvite.invited_by?.[0]?.full_name || selectedInvite.invited_by?.[0]?.email || 'Unknown'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Created</h4>
                                  <p className="text-sm text-muted-foreground">{formatDate(selectedInvite.created_at)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Expires</h4>
                                  <p className="text-sm text-muted-foreground">{formatDate(selectedInvite.expires_at)}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Status</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedInvite.accepted_at ? 'Accepted' : timeLeft}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        {!invite.accepted_at && new Date(invite.expires_at) > now && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                            disabled={isResending === invite.id}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className={`h-4 w-4 ${isResending === invite.id ? 'animate-spin' : ''}`} />
                            Resend
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInvite(invite.id)}
                          disabled={isDeleting === invite.id}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {invites.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No invitations</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No invitations have been sent yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

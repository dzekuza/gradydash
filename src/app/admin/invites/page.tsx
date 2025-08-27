import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  UserPlus, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Trash2
} from 'lucide-react'

export default async function AdminInvitesPage() {
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

  // Get all environment invites using service role client for admin operations
  const { data: invites, error: invitesError } = await supabase
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
  }

  // Calculate invite statistics based on accepted_at and expires_at
  const now = new Date()
  const pendingInvites = invites?.filter(invite => !invite.accepted_at && new Date(invite.expires_at) > now) || []
  const acceptedInvites = invites?.filter(invite => invite.accepted_at) || []
  const expiredInvites = invites?.filter(invite => !invite.accepted_at && new Date(invite.expires_at) <= now) || []

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
          <h2 className="text-3xl font-bold tracking-tight">Invitation Management</h2>
          <p className="text-muted-foreground">
            Manage environment invitations and track their status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invites?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All invitations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvites.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedInvites.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully joined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredInvites.length}</div>
            <p className="text-xs text-muted-foreground">
              Past expiration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invites List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
          <CardDescription>
            Track invitation status and manage pending invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invites?.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{invite.email}</h3>
                    {getStatusBadge(invite.accepted_at, invite.expires_at)}
                    <Badge variant="outline">{invite.role}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Invited to {(invite.environments as any)?.name || 'Unknown Environment'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(invite.created_at).toLocaleDateString()}
                    </span>
                    {invite.invited_by && (
                      <span className="flex items-center gap-1">
                        by {(invite.invited_by as any)?.full_name || (invite.invited_by as any)?.email}
                      </span>
                    )}
                  </div>
                  {!invite.accepted_at && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Expires: {new Date(invite.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {!invite.accepted_at && new Date(invite.expires_at) > now && (
                    <>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(!invites || invites.length === 0) && (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No invitations</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by sending your first invitation.
                </p>
                <div className="mt-6">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invitation
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

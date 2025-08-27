'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PendingInvite } from '@/lib/db/environments/get-pending-invites'
import { resendInvite, cancelInvite } from '@/lib/db/environments/manage-invites'
import { 
  Mail, 
  Calendar, 
  Building2, 
  User, 
  Clock, 
  RefreshCw, 
  X,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PendingInvitesProps {
  invites: PendingInvite[]
  onInviteUpdate: () => void
}

export function PendingInvites({ invites, onInviteUpdate }: PendingInvitesProps) {
  const [isResending, setIsResending] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState<string | null>(null)
  const { toast } = useToast()

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

  const handleResendInvite = async (inviteId: string) => {
    setIsResending(inviteId)
    try {
      await resendInvite(inviteId)
      toast({
        title: 'Invite resent',
        description: 'The invitation has been resent successfully.',
      })
      onInviteUpdate()
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

  const handleCancelInvite = async (inviteId: string) => {
    setIsCancelling(inviteId)
    try {
      await cancelInvite(inviteId)
      toast({
        title: 'Invite cancelled',
        description: 'The invitation has been cancelled.',
      })
      onInviteUpdate()
    } catch (error) {
      console.error('Error cancelling invite:', error)
      toast({
        title: 'Failed to cancel',
        description: error instanceof Error ? error.message : 'Failed to cancel invitation',
        variant: 'destructive',
      })
    } finally {
      setIsCancelling(null)
    }
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invites
          </CardTitle>
          <CardDescription>
            No pending invitations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invites ({invites.length})
        </CardTitle>
        <CardDescription>
          Invitations that are waiting for user acceptance
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
                    <Badge variant={isExpiringSoon ? "destructive" : "secondary"}>
                      {invite.role}
                    </Badge>
                    {isExpiringSoon && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {invite.environment?.name || 'Unknown Environment'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Invited {formatDate(invite.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeLeft}
                    </span>
                    {invite.inviter && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        by {invite.inviter.full_name || invite.inviter.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelInvite(invite.id)}
                    disabled={isCancelling === invite.id}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

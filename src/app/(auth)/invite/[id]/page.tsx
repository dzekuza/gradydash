import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getInvite } from '@/lib/db/environments/get-invite'
import { AcceptInviteForm } from '@/components/auth/accept-invite-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface InvitePageProps {
  params: {
    id: string
  }
}

async function InviteContent({ inviteId }: { inviteId: string }) {
  const supabase = createClient()

  try {
    const invite = await getInvite(inviteId)

    // Check if invitation is expired
    const isExpired = new Date(invite.expires_at) < new Date()

    // Check if already accepted
    if (invite.accepted_at) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-green-600">Invitation Accepted</CardTitle>
              <CardDescription className="text-center">
                You have already accepted this invitation to join {invite.environments.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                You can now access the environment from your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (isExpired) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Invitation Expired</CardTitle>
              <CardDescription className="text-center">
                This invitation to join {invite.environments.name} has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Please contact the environment administrator for a new invitation.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">You&apos;re Invited!</CardTitle>
            <CardDescription className="text-center">
              You&apos;ve been invited to join <strong>{invite.environments.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Role: <span className="font-medium">{invite.role.replace('_', ' ')}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(invite.expires_at).toLocaleDateString()}
                </p>
              </div>
              <AcceptInviteForm inviteId={inviteId} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading invite:', error)
    notFound()
  }
}

function InviteSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InvitePage({ params }: InvitePageProps) {
  return (
    <Suspense fallback={<InviteSkeleton />}>
      <InviteContent inviteId={params.id} />
    </Suspense>
  )
}

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getEnvironmentMembers } from '@/lib/db/environments/get-members'
import { getEnvironmentInvites } from '@/lib/db/environments/get-invites'
import { InviteMemberDialog } from '@/components/members/invite-member-dialog'
import { MembersDataTable } from '@/components/members/members-data-table'
import { Skeleton } from '@/components/ui/skeleton'

interface MembersPageProps {
  params: {
    env: string
  }
}

async function MembersContent({ environmentSlug }: { environmentSlug: string }) {
  const supabase = createClient()

  // Get the environment
  const { data: environment, error: envError } = await supabase
    .from('environments')
    .select('id, name, slug')
    .eq('slug', environmentSlug)
    .single()

  if (envError || !environment) {
    notFound()
  }

  // Get current user's membership to check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('environment_id', environment.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Check if user can invite members
  const canInvite = ['reseller_manager', 'grady_staff', 'grady_admin'].includes(membership.role)

  // Fetch members and invites
  const [members, invites] = await Promise.all([
    getEnvironmentMembers(environment.id),
    getEnvironmentInvites(environment.id)
  ])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        {canInvite && (
          <InviteMemberDialog 
            environmentId={environment.id} 
            environmentName={environment.name}
            currentUserId={user.id}
          />
        )}
      </div>
      
      <MembersDataTable members={members} invites={invites} />
    </div>
  )
}

function MembersSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function MembersPage({ params }: MembersPageProps) {
  return (
    <Suspense fallback={<MembersSkeleton />}>
      <MembersContent environmentSlug={params.env} />
    </Suspense>
  )
}

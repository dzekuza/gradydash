import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-server'
import { getEnvironmentMembers } from '@/lib/db/environments/get-members'
import { InviteMemberDialog } from '@/components/members/invite-member-dialog'
import { MembersDataTable } from '@/components/members/members-data-table'
import { InviteCodesSection } from '@/components/members/invite-codes-section'
import { Skeleton } from '@/components/ui/skeleton'

interface MembersPageProps {
  params: {
    env: string
  }
}

async function MembersContent({ environmentSlug }: { environmentSlug: string }) {
  const supabase = createClient()

  // Get the partner (access already checked in layout)
  const { data: environment, error: envError } = await supabase
    .from('partners')
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
    .eq('partner_id', environment.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    notFound()
  }

  // Check permissions
  const canInvite = ['admin', 'store_manager'].includes(membership.role)
  const isAdmin = membership.role === 'admin'

  // Fetch members
  const members = await getEnvironmentMembers(environment.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
      </div>
      
      <div className="grid gap-6">
        {/* Invite Codes Section - Only show for admins */}
        {isAdmin && (
          <InviteCodesSection partnerId={environment.id} />
        )}
        
        {/* Members Table */}
        <MembersDataTable 
          members={members} 
          canInvite={canInvite}
          environmentId={environment.id}
          environmentName={environment.name}
          currentUserId={user.id}
        />
      </div>
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

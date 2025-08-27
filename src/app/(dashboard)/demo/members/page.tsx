import { InviteMemberDialog } from '@/components/members/invite-member-dialog'
import { MembersDataTable } from '@/components/members/members-data-table'

// Demo data for the demo environment
const demoMembers = [
  {
    id: '1',
    role: 'store_manager',
    created_at: '2024-01-15T10:00:00Z',
    profiles: {
      id: '1',
      email: 'manager@demo.com',
      full_name: 'Demo Manager',
      avatar_url: null
    }
  },
  {
    id: '2',
    role: 'store_manager',
    created_at: '2024-01-20T14:30:00Z',
    profiles: {
      id: '2',
      email: 'staff@demo.com',
      full_name: 'Demo Staff',
      avatar_url: null
    }
  }
]

const demoInvites = [
  {
    id: '1',
    email: 'newmember@demo.com',
    role: 'store_manager',
    created_at: '2024-01-25T09:00:00Z',
    expires_at: '2024-02-01T09:00:00Z',
    environments: {
      name: 'Demo Environment',
      slug: 'demo'
    }
  }
]

export default function DemoMembersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        <InviteMemberDialog 
          environmentId="demo-env-id" 
          environmentName="Demo Environment"
          currentUserId="demo-user-id"
        />
      </div>
      
      <MembersDataTable members={demoMembers} invites={demoInvites} />
    </div>
  )
}

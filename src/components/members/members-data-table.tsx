'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { InviteMemberDialog } from '@/components/members/invite-member-dialog'
import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Mail, User, CheckCircle } from 'lucide-react'

interface Member {
  id: string
  role: string
  created_at: string
  profiles: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}



interface MembersDataTableProps {
  members: Member[]
  canInvite?: boolean
  environmentId?: string
  environmentName?: string
  currentUserId?: string
}

const getRoleBadge = (role: string) => {
  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    store_manager: 'bg-blue-100 text-blue-800',
  }
  
  const roleLabels = {
    admin: 'Admin',
    store_manager: 'Store Manager',
  }
  
  return (
    <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-muted text-muted-foreground'}>
      {roleLabels[role as keyof typeof roleLabels] || role.replace('_', ' ')}
    </Badge>
  )
}

const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

const memberColumns: ColumnDef<Member>[] = [
  {
    accessorKey: 'profiles',
    header: 'Member',
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.profiles.avatar_url || undefined} />
            <AvatarFallback>
              {getInitials(member.profiles.full_name, member.profiles.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {member.profiles.full_name || 'Unnamed User'}
            </div>
            <div className="text-sm text-muted-foreground">
              {member.profiles.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => getRoleBadge(row.original.role),
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Active
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        </div>
      )
    },
  },
]



export function MembersDataTable({ 
  members, 
  canInvite = false,
  environmentId,
  environmentName,
  currentUserId
}: MembersDataTableProps) {
  return (
    <div className="space-y-6">
      {/* Current Members */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Current Members</h3>
                      <p className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? 's' : ''} in this partner
            </p>
        </div>
        
        <DataTable 
          columns={memberColumns} 
          data={members}
          filterPlaceholder="Filter members..."
          actionButtons={
            canInvite && environmentId && environmentName && currentUserId ? (
              <InviteMemberDialog 
                environmentId={environmentId} 
                environmentName={environmentName}
                currentUserId={currentUserId}
              />
            ) : undefined
          }
        />
        
        {members.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No members yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by inviting your first team member.
            </p>
          </div>
        )}
      </div>


    </div>
  )
}

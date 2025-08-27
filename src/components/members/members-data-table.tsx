'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Mail, User, Clock, CheckCircle } from 'lucide-react'

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

interface Invite {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
  environments: {
    name: string
    slug: string
  }
}

interface MembersDataTableProps {
  members: Member[]
  invites: Invite[]
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
    <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
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

const inviteColumns: ColumnDef<Invite>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => getRoleBadge(row.original.role),
  },
  {
    accessorKey: 'created_at',
    header: 'Sent',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: 'expires_at',
    header: 'Expires',
    cell: ({ row }) => {
      const isExpired = new Date(row.original.expires_at) < new Date()
      return (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.expires_at), { addSuffix: true })}
        </span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isExpired = new Date(row.original.expires_at) < new Date()
      return isExpired ? (
        <Badge variant="destructive">Expired</Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    },
  },
]

export function MembersDataTable({ members, invites }: MembersDataTableProps) {
  return (
    <div className="space-y-6">
      {/* Current Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Members</h3>
            <p className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? 's' : ''} in this environment
            </p>
          </div>
        </div>
        
        <DataTable 
          columns={memberColumns} 
          data={members}
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

      {/* Pending Invitations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pending Invitations</h3>
            <p className="text-sm text-muted-foreground">
              {invites.length} pending invitation{invites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <DataTable 
          columns={inviteColumns} 
          data={invites}
        />
        
        {invites.length === 0 && (
          <div className="text-center py-8">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No pending invitations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All invitations have been accepted or expired.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

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
    grady_admin: 'bg-red-100 text-red-800',
    grady_staff: 'bg-orange-100 text-orange-800',
    reseller_manager: 'bg-blue-100 text-blue-800',
    reseller_staff: 'bg-gray-100 text-gray-800',
  }
  
  return (
    <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
      {role.replace('_', ' ')}
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
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.expires_at), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: 'status',
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
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Current Members ({members.length})</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Active members with access to this environment
        </p>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No members yet. Invite someone to get started.
          </p>
        ) : (
          <DataTable columns={memberColumns} data={members} />
        )}
      </div>

      {/* Pending Invitations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Pending Invitations ({invites.length})</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Invitations that have been sent but not yet accepted
        </p>
        {invites.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No pending invitations
          </p>
        ) : (
          <DataTable columns={inviteColumns} data={invites} />
        )}
      </div>
    </div>
  )
}

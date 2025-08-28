'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { inviteMember } from '@/lib/db/environments/invite-member'
import { Loader2, UserPlus } from 'lucide-react'

interface AdminInviteUserDialogProps {
  trigger?: React.ReactNode
  environments?: Array<{ id: string; name: string }>
}

export function AdminInviteUserDialog({ 
  trigger,
  environments = []
}: AdminInviteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('store_manager')
  const [inviteType, setInviteType] = useState('environment')
  const [targetEnvironmentId, setTargetEnvironmentId] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('role', role)
      formData.append('inviteType', inviteType)
      
      if (inviteType === 'environment') {
        if (!targetEnvironmentId) {
          throw new Error('Please select a partner')
        }
        formData.append('environmentId', targetEnvironmentId)
        formData.append('targetEnvironmentId', targetEnvironmentId)
      } else {
        // For system admin, we don't need environment ID
        formData.append('environmentId', '')
        formData.append('targetEnvironmentId', '')
      }

      const result = await inviteMember(formData)

      // Get target partner name for the toast message
      const targetEnv = inviteType === 'system_admin' 
        ? 'System Administration' 
        : environments.find(env => env.id === targetEnvironmentId)?.name || 'Unknown Partner'

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email} to join ${targetEnv}`,
      })

      setEmail('')
      setRole('store_manager')
      setInviteType('environment')
      setTargetEnvironmentId('')
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleOptions = () => {
    if (inviteType === 'system_admin') {
      return [
        { value: 'admin', label: 'System Administrator' },
      ]
    }
    
    return [
      { value: 'store_manager', label: 'Store Manager' },
      { value: 'admin', label: 'Partner Admin' },
    ]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to join the system or a specific partner
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inviteType">Invitation Type</Label>
            <Select value={inviteType} onValueChange={setInviteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">Partner Member</SelectItem>
                <SelectItem value="system_admin">System Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {inviteType === 'environment' && (
            <div className="space-y-2">
              <Label htmlFor="environment">Partner</Label>
              <Select value={targetEnvironmentId} onValueChange={setTargetEnvironmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map(env => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getRoleOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

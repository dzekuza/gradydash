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

import { useToast } from '@/hooks/use-toast'
import { inviteMember } from '@/lib/db/environments/invite-member'
import { Loader2, UserPlus } from 'lucide-react'

interface InviteMemberDialogProps {
  environmentId: string
  environmentName: string
  currentUserId: string
}

export function InviteMemberDialog({ 
  environmentId, 
  environmentName, 
  currentUserId
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('store_manager')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('role', 'store_manager')
      formData.append('environmentId', environmentId)
      formData.append('inviteType', 'environment')

      const result = await inviteMember(formData)

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email} to join ${environmentName} as Partner Manager`,
      })

      setEmail('')
      setRole('store_manager')
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



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Partner Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Partner Manager</DialogTitle>
          <DialogDescription>
            Send an invitation to join {environmentName} as a Partner Manager
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="px-3 py-2 text-sm bg-muted rounded-md">
              Partner Manager
            </div>
            <p className="text-xs text-muted-foreground">
              Invited users will be able to manage this partner&apos;s dashboard
            </p>
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

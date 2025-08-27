'use client'

import { useState, useEffect } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { inviteMember } from '@/lib/db/environments/invite-member'
import { getAllEnvironments } from '@/lib/db/environments/get-all-environments'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Building2, Shield } from 'lucide-react'

interface InviteMemberDialogProps {
  environmentId: string
  environmentName: string
  currentUserId: string
}

interface Environment {
  id: string
  name: string
  slug: string
  description?: string
}

export function InviteMemberDialog({ 
  environmentId, 
  environmentName, 
  currentUserId 
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('store_manager')
  const [inviteType, setInviteType] = useState<'environment' | 'system_admin'>('environment')
  const [targetEnvironmentId, setTargetEnvironmentId] = useState(environmentId)
  const [isLoading, setIsLoading] = useState(false)
  const [isSystemAdmin, setIsSystemAdmin] = useState(false)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const { toast } = useToast()
  const router = useRouter()

  // Check user's admin status and load environments on dialog open
  useEffect(() => {
    if (open) {
      const checkAdminStatus = async () => {
        try {
          const { isSystemAdmin: adminStatus } = await getUserAdminStatus(currentUserId)
          setIsSystemAdmin(adminStatus)
          
          if (adminStatus) {
            const allEnvironments = await getAllEnvironments()
            setEnvironments(allEnvironments)
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
      
      checkAdminStatus()
    }
  }, [open, currentUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('role', role)
      formData.append('environmentId', environmentId)
      formData.append('inviteType', inviteType)
      
      if (inviteType === 'environment' && isSystemAdmin) {
        formData.append('targetEnvironmentId', targetEnvironmentId)
      }

      const result = await inviteMember(formData)

      const targetEnv = inviteType === 'system_admin' 
        ? 'system-wide admin' 
        : environments.find(env => env.id === targetEnvironmentId)?.name || environmentName

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email} to join ${targetEnv}`,
      })

      // Show the invitation URL in the console for now
      if (result.inviteUrl) {
        console.log('Invitation URL:', result.inviteUrl)
      }

      setEmail('')
      setRole('store_manager')
      setInviteType('environment')
      setTargetEnvironmentId(environmentId)
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
        { value: 'admin', label: 'Admin' }
      ]
    }
    return [
      { value: 'store_manager', label: 'Store Manager' }
    ]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            {isSystemAdmin 
              ? 'Send an invitation to join a specific environment or become a system-wide admin.'
              : `Send an invitation to join the ${environmentName} environment as a manager.`
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {isSystemAdmin && (
              <div className="grid gap-2">
                <Label>Invitation Type</Label>
                <RadioGroup 
                  value={inviteType} 
                  onValueChange={(value: 'environment' | 'system_admin') => {
                    setInviteType(value)
                    if (value === 'environment') {
                      setRole('store_manager')
                    } else {
                      setRole('admin')
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="environment" id="environment" />
                    <Label htmlFor="environment" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Environment Member
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system_admin" id="system_admin" />
                    <Label htmlFor="system_admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      System Admin
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {inviteType === 'environment' && isSystemAdmin && (
              <div className="grid gap-2">
                <Label htmlFor="targetEnvironment">Target Environment</Label>
                <Select value={targetEnvironmentId} onValueChange={setTargetEnvironmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {getRoleOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

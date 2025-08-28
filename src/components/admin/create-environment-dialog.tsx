'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { createEnvironmentAdmin } from '@/lib/db/environments/create-environment-admin'
import { LogoUpload } from '@/components/admin/logo-upload'
import { MemberInvitations, MemberInvitation } from '@/components/admin/member-invitations'

export function CreateEnvironmentDialog() {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [invitations, setInvitations] = useState<MemberInvitation[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsCreating(true)
    
    try {
      // Add logo file to form data if present
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      // Add invitations to form data
      if (invitations.length > 0) {
        formData.append('invitations', JSON.stringify(invitations))
      }

      const result = await createEnvironmentAdmin(formData)
      setOpen(false)
      
      // Reset form state
      setLogoFile(null)
      setInvitations([])
      
      toast({
        title: 'Partner created',
        description: 'The partner has been created successfully.',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to create environment:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create partner',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setLogoFile(null)
    setInvitations([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Environment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Partner</DialogTitle>
          <DialogDescription>
            Create a new partner for a reseller. This will create a new workspace with its own products, locations, and members.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter partner name"
                required
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Partner Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="environment-slug"
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens allowed"
                required
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the URL: /[slug]
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe this partner..."
                rows={3}
                disabled={isCreating}
              />
            </div>
            
            <LogoUpload 
              onLogoChange={setLogoFile}
              disabled={isCreating}
            />
            
            <MemberInvitations
              invitations={invitations}
              onInvitationsChange={setInvitations}
              disabled={isCreating}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isCreating ? 'Creating...' : 'Create Partner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

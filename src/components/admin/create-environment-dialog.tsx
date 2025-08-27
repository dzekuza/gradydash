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

export function CreateEnvironmentDialog() {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsCreating(true)
    
    try {
      const result = await createEnvironmentAdmin(formData)
      setOpen(false)
      toast({
        title: 'Environment created',
        description: 'The environment has been created successfully.',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to create environment:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create environment',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Environment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Environment</DialogTitle>
          <DialogDescription>
            Create a new environment for a reseller. This will create a new workspace with its own products, locations, and members.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Environment Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter environment name"
                required
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Environment Slug</Label>
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
                placeholder="Describe this environment..."
                rows={3}
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isCreating ? 'Creating...' : 'Create Environment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

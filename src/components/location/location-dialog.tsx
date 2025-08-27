'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
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
import { createLocation } from '@/lib/db/locations/create-location'

interface LocationDialogProps {
  environmentId: string
  location?: {
    id: string
    name: string
    description?: string
    address?: string
    contact_person_name?: string
    contact_email?: string
    contact_phone?: string
  }
  trigger?: React.ReactNode
}

export function LocationDialog({ environmentId, location, trigger }: LocationDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const { toast } = useToast()

  const handleCreateLocation = async (formData: FormData) => {
    setIsCreating(true)
    
    try {
      formData.append('environmentId', environmentId)
      await createLocation(formData)
      setOpen(false)
      toast({
        title: 'Location created',
        description: 'Your new location has been created successfully.',
      })
    } catch (error) {
      console.error('Failed to create location:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create location',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? 'Edit Location' : 'Create New Location'}</DialogTitle>
          <DialogDescription>
            {location ? 'Update the location details.' : 'Create a new physical location for storing or selling products.'}
          </DialogDescription>
        </DialogHeader>
        <form action={handleCreateLocation}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Main Warehouse, Store Front, Repair Center"
                defaultValue={location?.name}
                required
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the location"
                defaultValue={location?.description}
                disabled={isCreating}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Full address of the location"
                defaultValue={location?.address}
                disabled={isCreating}
                rows={2}
              />
            </div>
            
            {/* Contact Information Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Contact Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="contact_person_name" className="text-xs">Contact Person</Label>
                  <Input
                    id="contact_person_name"
                    name="contact_person_name"
                    type="text"
                    placeholder="Full name"
                    defaultValue={location?.contact_person_name}
                    disabled={isCreating}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_email" className="text-xs">Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="contact@example.com"
                    defaultValue={location?.contact_email}
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact_phone" className="text-xs">Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  defaultValue={location?.contact_phone}
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : (location ? 'Update Location' : 'Create Location')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

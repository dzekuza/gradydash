'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  MapPin, 
  Building2, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AdminLocation } from '@/types/admin'
import { locationTypes, getLocationTypeIcon, getLocationTypeLabel } from '@/lib/constants/location-types'

interface AdminLocationCardProps {
  location: AdminLocation
  onLocationUpdated: () => void
}

export default function AdminLocationCard({ location, onLocationUpdated }: AdminLocationCardProps) {
  const { toast } = useToast()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: location.name,
    description: location.description || '',
    address: location.address || '',
    contact_person_name: location.contact_person_name || '',
    contact_email: location.contact_email || '',
    contact_phone: location.contact_phone || '',
    location_type: location.location_type,
    is_active: location.is_active
  })



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleEditLocation = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Location name is required.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: location.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          address: formData.address.trim() || null,
          contact_person_name: formData.contact_person_name.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          contact_phone: formData.contact_phone.trim() || null,
          location_type: formData.location_type,
          is_active: formData.is_active,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update location')
      }

      toast({
        title: 'Location Updated',
        description: 'The location has been updated successfully.',
      })

      setIsEditDialogOpen(false)
      onLocationUpdated()

    } catch (error) {
      console.error('Error updating location:', error)
      toast({
        title: 'Failed to update location',
        description: error instanceof Error ? error.message : 'An error occurred while updating the location',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/locations?id=${location.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete location')
      }

      toast({
        title: 'Location Deleted',
        description: 'The location has been deleted successfully.',
      })

      onLocationUpdated()

    } catch (error) {
      console.error('Error deleting location:', error)
      toast({
        title: 'Failed to delete location',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the location',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = () => {
    setFormData({
      name: location.name,
      description: location.description || '',
      address: location.address || '',
      contact_person_name: location.contact_person_name || '',
      contact_email: location.contact_email || '',
      contact_phone: location.contact_phone || '',
      location_type: location.location_type,
      is_active: location.is_active
    })
    setIsEditDialogOpen(true)
  }

  const LocationTypeIcon = getLocationTypeIcon(location.location_type)

  return (
    <>
      <div className="flex flex-col p-4 border rounded-lg gap-3">
        <div className="flex items-center gap-3">
          <LocationTypeIcon className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold">{location.name}</h3>
              <div className="flex flex-wrap gap-2">
                {location.is_active ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
                <Badge variant="outline">{getLocationTypeLabel(location.location_type)}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {location.description && (
          <p className="text-sm text-muted-foreground">
            {location.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          {location.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location.address}
            </span>
          )}
          {location.contact_person_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {location.contact_person_name}
            </span>
          )}
          {location.contact_email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {location.contact_email}
            </span>
          )}
          {location.contact_phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {location.contact_phone}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Created {formatDate(location.created_at)}
          </span>
        </div>
        
        <div className="flex flex-col gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openEditDialog}
            className="w-full"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 w-full"
            onClick={handleDeleteLocation}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the location information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Location Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location_type">Location Type</Label>
                <Select value={formData.location_type} onValueChange={(value) => setFormData({ ...formData, location_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this location"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address of the location"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contact_person">Contact Person</Label>
                <Input
                  id="edit-contact_person"
                  value={formData.contact_person_name}
                  onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_email">Contact Email</Label>
                <Input
                  id="edit-contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact_phone">Contact Phone</Label>
                <Input
                  id="edit-contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Active Location</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLocation} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Location'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

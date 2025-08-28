'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-browser'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  MapPin, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  User,
  Warehouse,
  Store,
  Building,
  Factory,
  Home,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminLocation {
  id: string
  name: string
  description: string | null
  address: string | null
  contact_person_name: string | null
  contact_email: string | null
  contact_phone: string | null
  location_type: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: {
    id: string
    full_name: string
    email: string
  } | null
}

const locationTypes = [
  { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { value: 'store', label: 'Store', icon: Store },
  { value: 'office', label: 'Office', icon: Building },
  { value: 'factory', label: 'Factory', icon: Factory },
  { value: 'home', label: 'Home', icon: Home },
]

export default function AdminLocationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locations, setLocations] = useState<AdminLocation[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<AdminLocation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
    location_type: 'warehouse',
    is_active: true
  })

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        
        // Check authentication
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Check admin status via API
        const adminStatusResponse = await fetch('/api/admin/user-status')
        if (!adminStatusResponse.ok) {
          router.push('/dashboard')
          return
        }
        
        const adminStatus = await adminStatusResponse.json()
        
        if (!adminStatus.isSystemAdmin) {
          router.push('/dashboard')
          return
        }

        setIsAdmin(true)

        // Get all admin locations via API
        const response = await fetch('/api/admin/locations')
        if (response.ok) {
          const { data: adminLocations } = await response.json()
          
          // Transform the data to match our interface
          const transformedLocations: AdminLocation[] = (adminLocations || []).map((location: any) => ({
            id: location.id,
            name: location.name,
            description: location.description,
            address: location.address,
            contact_person_name: location.contact_person_name,
            contact_email: location.contact_email,
            contact_phone: location.contact_phone,
            location_type: location.location_type,
            is_active: location.is_active,
            created_at: location.created_at,
            updated_at: location.updated_at,
            created_by: location.created_by?.[0] || null
          }))
          setLocations(transformedLocations)
        } else {
          console.error('Error fetching admin locations:', response.statusText)
        }

      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      contact_person_name: '',
      contact_email: '',
      contact_phone: '',
      location_type: 'warehouse',
      is_active: true
    })
  }

  const handleCreateLocation = async () => {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        throw new Error(errorData.error || 'Failed to create location')
      }

      const { data } = await response.json()

      toast({
        title: 'Location Created',
        description: 'The location has been created successfully.',
      })

      // Refresh locations list
      const refreshResponse = await fetch('/api/admin/locations')
      if (refreshResponse.ok) {
        const { data: adminLocations } = await refreshResponse.json()
        
        // Transform the data to match our interface
        const transformedLocations: AdminLocation[] = (adminLocations || []).map((location: any) => ({
          id: location.id,
          name: location.name,
          description: location.description,
          address: location.address,
          contact_person_name: location.contact_person_name,
          contact_email: location.contact_email,
          contact_phone: location.contact_phone,
          location_type: location.location_type,
          is_active: location.is_active,
          created_at: location.created_at,
          updated_at: location.updated_at,
          created_by: location.created_by?.[0] || null
        }))
        setLocations(transformedLocations)
      }

      setIsCreateDialogOpen(false)
      resetForm()

    } catch (error) {
      console.error('Error creating location:', error)
      toast({
        title: 'Failed to create location',
        description: error instanceof Error ? error.message : 'An error occurred while creating the location',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditLocation = async () => {
    if (!selectedLocation || !formData.name.trim()) {
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
          id: selectedLocation.id,
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

      // Refresh locations list
      const refreshResponse = await fetch('/api/admin/locations')
      if (refreshResponse.ok) {
        const { data: adminLocations } = await refreshResponse.json()
        
        // Transform the data to match our interface
        const transformedLocations: AdminLocation[] = (adminLocations || []).map((location: any) => ({
          id: location.id,
          name: location.name,
          description: location.description,
          address: location.address,
          contact_person_name: location.contact_person_name,
          contact_email: location.contact_email,
          contact_phone: location.contact_phone,
          location_type: location.location_type,
          is_active: location.is_active,
          created_at: location.created_at,
          updated_at: location.updated_at,
          created_by: location.created_by?.[0] || null
        }))
        setLocations(transformedLocations)
      }

      setIsEditDialogOpen(false)
      setSelectedLocation(null)
      resetForm()

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

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/locations?id=${locationId}`, {
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

      // Refresh locations list
      const refreshResponse = await fetch('/api/admin/locations')
      if (refreshResponse.ok) {
        const { data: adminLocations } = await refreshResponse.json()
        
        // Transform the data to match our interface
        const transformedLocations: AdminLocation[] = (adminLocations || []).map((location: any) => ({
          id: location.id,
          name: location.name,
          description: location.description,
          address: location.address,
          contact_person_name: location.contact_person_name,
          contact_email: location.contact_email,
          contact_phone: location.contact_phone,
          location_type: location.location_type,
          is_active: location.is_active,
          created_at: location.created_at,
          updated_at: location.updated_at,
          created_by: location.created_by?.[0] || null
        }))
        setLocations(transformedLocations)
      }

    } catch (error) {
      console.error('Error deleting location:', error)
      toast({
        title: 'Failed to delete location',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the location',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (location: AdminLocation) => {
    setSelectedLocation(location)
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

  const getLocationTypeIcon = (type: string) => {
    const locationType = locationTypes.find(lt => lt.value === type)
    return locationType ? locationType.icon : Building2
  }

  const getLocationTypeLabel = (type: string) => {
    const locationType = locationTypes.find(lt => lt.value === type)
    return locationType ? locationType.label : type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  // Calculate statistics
  const totalLocations = locations.length
  const activeLocations = locations.filter(loc => loc.is_active).length
  const warehouseCount = locations.filter(loc => loc.location_type === 'warehouse').length
  const storeCount = locations.filter(loc => loc.location_type === 'store').length

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Location Management</h2>
          <p className="text-muted-foreground">
            Manage system-wide locations for product storage and operations
          </p>
          <div className="mt-4 md:hidden">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Location</DialogTitle>
                <DialogDescription>
                  Add a new system-wide location for product storage and operations.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Main Warehouse"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_type">Location Type</Label>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this location"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address of the location"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person_name}
                      onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Location</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLocation} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Location'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              All locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLocations}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouseCount}</div>
            <p className="text-xs text-muted-foreground">
              Storage facilities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeCount}</div>
            <p className="text-xs text-muted-foreground">
              Retail locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>
            View and manage all system-wide locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {locations.map((location) => {
              const LocationTypeIcon = getLocationTypeIcon(location.location_type)
              
              return (
                <div key={location.id} className="flex flex-col p-4 border rounded-lg gap-3">
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
                      onClick={() => openEditDialog(location)}
                      className="w-full"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 w-full"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {locations.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No locations yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first location to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}

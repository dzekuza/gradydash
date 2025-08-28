'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client-browser'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  MapPin, 
  Plus, 
  CheckCircle,
  Warehouse,
  Store
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AdminLocation } from '@/types/admin'
import { locationTypes } from '@/lib/constants/location-types'
import AdminLocationCard from '@/components/admin/admin-location-card'

export default function AdminLocationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locations, setLocations] = useState<AdminLocation[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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
      await refreshLocations()

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



  const refreshLocations = async () => {
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
            {locations.map((location) => (
              <AdminLocationCard 
                key={location.id} 
                location={location} 
                onLocationUpdated={refreshLocations}
              />
            ))}
            
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


    </div>
  )
}

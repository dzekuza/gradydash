'use client'

import * as React from 'react'
import { MapPin, Edit, Trash2, Package, User, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LocationDialog } from './location-dialog'

interface Location {
  id: string
  name: string
  description?: string
  address?: string
  contact_person_name?: string
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

interface LocationCardProps {
  location: Location
  environmentId: string
}

export function LocationCard({ location, environmentId }: LocationCardProps) {
  const [productCount, setProductCount] = React.useState<number>(0)

  React.useEffect(() => {
    // Fetch product count for this location
    const fetchProductCount = async () => {
      try {
        const response = await fetch(`/api/locations/${location.id}/product-count`)
        if (response.ok) {
          const data = await response.json()
          setProductCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching product count:', error)
      }
    }
    
    fetchProductCount()
  }, [location.id])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{location.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <LocationDialog 
                  environmentId={environmentId} 
                  location={location}
                  trigger={<span>Edit Location</span>}
                />
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {location.description && (
          <CardDescription>{location.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {location.address && (
          <div className="text-sm text-muted-foreground">
            <strong>Address:</strong> {location.address}
          </div>
        )}
        
        {/* Contact Information */}
        {(location.contact_person_name || location.contact_email || location.contact_phone) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-sm font-medium text-muted-foreground">Contact Information</div>
            {location.contact_person_name && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{location.contact_person_name}</span>
              </div>
            )}
            {location.contact_email && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{location.contact_email}</span>
              </div>
            )}
            {location.contact_phone && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{location.contact_phone}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {productCount} products
            </span>
          </div>
          <Badge variant="secondary">
            Active
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Created {new Date(location.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

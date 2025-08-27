import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { getLocations } from '@/lib/db/locations/get-locations'
import { createClient } from '@/lib/supabase/client-server'
import { LocationDialog } from '@/components/location/location-dialog'
import { LocationCard } from '@/components/location/location-card'

export default async function DemoLocationsPage() {
  const demoEnvironmentId = await getDemoEnvironmentId()
  const locations = await getLocations(demoEnvironmentId)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <LocationDialog environmentId={demoEnvironmentId} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
        
        {locations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first location to start organizing products geographically.
              </p>
              <LocationDialog environmentId={demoEnvironmentId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

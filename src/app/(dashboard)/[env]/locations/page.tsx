import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import { getLocations } from '@/lib/db/locations/get-locations'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'
import { LocationDialog } from '@/components/location/location-dialog'
import { LocationCard } from '@/components/location/location-card'

interface LocationsPageProps {
  params: {
    env: string
  }
}

async function LocationsList({ environmentId }: { environmentId: string }) {
  const locations = await getLocations(environmentId)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} environmentId={environmentId} />
      ))}
      
      {locations.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first location to start organizing products geographically.
            </p>
            <LocationDialog environmentId={environmentId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  // Get the environment by slug
  const environment = await getEnvironmentBySlug(params.env)
  if (!environment) {
    return <div>Environment not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <LocationDialog environmentId={environment.id} />
      </div>
      
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-5 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <LocationsList environmentId={environment.id} />
      </Suspense>
    </div>
  )
}

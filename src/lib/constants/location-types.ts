import { 
  Warehouse,
  Store,
  Building,
  Factory,
  Home
} from 'lucide-react'
import { LocationType } from '@/types/admin'

export const locationTypes: LocationType[] = [
  { value: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { value: 'store', label: 'Store', icon: Store },
  { value: 'office', label: 'Office', icon: Building },
  { value: 'factory', label: 'Factory', icon: Factory },
  { value: 'home', label: 'Home', icon: Home },
]

export const getLocationTypeIcon = (type: string) => {
  const locationType = locationTypes.find(lt => lt.value === type)
  return locationType ? locationType.icon : Building
}

export const getLocationTypeLabel = (type: string) => {
  const locationType = locationTypes.find(lt => lt.value === type)
  return locationType ? locationType.label : type
}

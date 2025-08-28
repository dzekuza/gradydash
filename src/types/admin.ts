export interface AdminLocation {
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

export interface LocationType {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export type Role = 'grady_admin' | 'grady_staff' | 'reseller_manager' | 'reseller_staff'

export type ProductStatus = 'taken' | 'in_repair' | 'selling' | 'sold' | 'returned' | 'discarded'

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Environment {
  id: string
  name: string
  slug: string
  description?: string
  created_by?: string | null
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  environment_id: string
  user_id: string
  role: Role
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  environment_id: string
  name: string
  description?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  environment_id: string
  title: string
  sku?: string
  barcode?: string
  description?: string
  status: ProductStatus
  location_id?: string
  purchase_price?: number
  selling_price?: number
  sold_price?: number
  sold_at?: string
  status_updated_at: string
  created_at: string
  updated_at: string
}

export interface ProductStatusHistory {
  id: string
  product_id: string
  from_status: ProductStatus
  to_status: ProductStatus
  note?: string
  changed_by?: string | null
  created_at: string
}

export interface ProductComment {
  id: string
  product_id: string
  user_id?: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  uploaded_by?: string | null
  created_at: string
}

export interface Sale {
  id: string
  product_id: string
  amount: number
  currency: string
  sold_by?: string | null
  sold_at: string
  created_at: string
}

export interface EnvironmentInvite {
  id: string
  environment_id: string
  email: string
  role: Role
  invited_by?: string | null
  accepted_at?: string
  expires_at: string
  created_at: string
}

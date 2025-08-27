'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Product, Location, ProductStatus } from '@/types/db'
import { createProduct } from '@/lib/db/products/create-product'
import { updateProduct } from '@/lib/db/products/update-product'
import { CategorySelector } from '@/components/product/category-selector'

interface ProductFormProps {
  product?: Product
  locations: Location[]
  environmentId?: string
  environments?: Array<{ id: string; name: string; slug: string; description?: string }>
  onSuccess?: () => void
  isLoading?: boolean
  setIsLoading?: (loading: boolean) => void
}

const productStatuses: { value: ProductStatus; label: string }[] = [
  { value: 'taken', label: 'Taken' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'selling', label: 'Selling' },
  { value: 'sold', label: 'Sold' },
  { value: 'returned', label: 'Returned' },
  { value: 'discarded', label: 'Discarded' },
]

export function ProductForm({ 
  product, 
  locations, 
  environmentId, 
  environments, 
  onSuccess, 
  isLoading: externalIsLoading, 
  setIsLoading: externalSetIsLoading 
}: ProductFormProps) {
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ProductStatus>(product?.status || 'taken')
  const [locationId, setLocationId] = useState<string>(product?.location_id || 'none')
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(environmentId || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.categories || []
  )
  const router = useRouter()

  // Use external loading state if provided, otherwise use internal
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  const setIsLoading = externalSetIsLoading || setInternalIsLoading

  const isEditing = !!product

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      if (selectedEnvironmentId) {
        formData.append('environment_id', selectedEnvironmentId)
      }

      // Add the select values to form data
      formData.append('status', status)
      formData.append('location_id', locationId === 'none' ? '' : locationId)
      
      // Add categories as JSON string
      formData.append('categories', JSON.stringify(selectedCategories))

      if (isEditing && product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Default behavior: navigate back
        router.back()
      }
    } catch (err) {
      console.error('Error saving product:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={product?.title}
                placeholder="e.g., iPhone 13 Pro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={product?.sku}
                placeholder="e.g., IP13P-001"
              />
            </div>
          </div>

          {environments && environments.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="environment_id">Environment *</Label>
              <Select value={selectedEnvironmentId} onValueChange={setSelectedEnvironmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                name="barcode"
                defaultValue={product?.barcode}
                placeholder="e.g., 1234567890123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(value: ProductStatus) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {productStatuses.map((statusOption) => (
                    <SelectItem key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (€)</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.purchase_price}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (€)</Label>
              <Input
                id="selling_price"
                name="selling_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.selling_price}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No location assigned</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <CategorySelector
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              placeholder="Select product categories..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
            </Button>
            {!onSuccess && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
  )
}

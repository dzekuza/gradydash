'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { columns } from '@/components/data-table/data'
import { Product, Location } from '@/types/db'
import { ProductDetailDialog } from '@/components/product/product-detail-dialog'
import { handleBulkAction } from '@/lib/db/products/bulk-actions'

interface ProductsTableWrapperProps {
  products: Product[]
}

export function ProductsTableWrapper({ products }: ProductsTableWrapperProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [productLocation, setProductLocation] = useState<Location | null>(null)

  const handleRowClick = async (product: Product) => {
    setSelectedProduct(product)
    
    // Fetch location data for the product
    if (product.location_id) {
      try {
        const response = await fetch(`/api/locations/${product.location_id}/product-count`)
        if (response.ok) {
          const locationData = await response.json()
          setProductLocation(locationData.location)
        }
      } catch (error) {
        console.error('Error fetching location:', error)
      }
    } else {
      setProductLocation(null)
    }
    
    setIsDetailDialogOpen(true)
  }

  const handleBulkActionWrapper = async (action: string, data: any) => {
    try {
      await handleBulkAction(action, data)
    } catch (error) {
      console.error('Bulk action error:', error)
      throw error
    }
  }

  return (
    <>
      <DataTable 
        columns={columns} 
        data={products} 
        onBulkAction={handleBulkActionWrapper}
        onRowClick={handleRowClick}
      />

      <ProductDetailDialog
        product={selectedProduct}
        location={productLocation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </>
  )
}

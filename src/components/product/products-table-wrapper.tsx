'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { columns } from '@/components/data-table/columns'
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions'
import { ColumnDef } from '@tanstack/react-table'
import { Product, Location } from '@/types/db'
import { ProductDetailDialog } from '@/components/product/product-detail-dialog'
import { bulkUpdateProductStatus, bulkDeleteProducts } from '@/lib/db/products/bulk-actions'

interface ProductsTableWrapperProps {
  products: Product[]
  environmentSlug: string
}

export function ProductsTableWrapper({ products, environmentSlug }: ProductsTableWrapperProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [productLocation, setProductLocation] = useState<Location | null>(null)

  // Create custom columns with environmentSlug
  const customColumns: ColumnDef<Product>[] = columns.map(column => {
    if (column.id === 'actions') {
      return {
        ...column,
        cell: ({ row }: any) => <DataTableRowActions row={row} environmentSlug={environmentSlug} />
      }
    }
    return column
  })

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
      if (action === 'updateStatus' && data.productIds && data.status) {
        await bulkUpdateProductStatus(data.productIds, data.status, environmentSlug)
      } else if (action === 'delete' && data.productIds) {
        await bulkDeleteProducts(data.productIds, environmentSlug)
      } else {
        throw new Error(`Unknown bulk action: ${action}`)
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      throw error
    }
  }

  return (
    <>
      <DataTable 
        columns={customColumns} 
        data={products} 
        onBulkAction={handleBulkActionWrapper}
        onRowClick={handleRowClick}
      />

      <ProductDetailDialog
        product={selectedProduct}
        location={productLocation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        environmentSlug={environmentSlug}
      />
    </>
  )
}

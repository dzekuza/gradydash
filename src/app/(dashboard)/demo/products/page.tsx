'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DataTable } from '@/components/data-table/data-table'
import { columns } from '@/components/data-table/data'
import { Product, Location } from '@/types/db'
import { ImportProductsDialog } from '@/components/product/import-products-dialog'
import { ProductDetailDialog } from '@/components/product/product-detail-dialog'
import { handleBulkAction } from '@/lib/db/products/bulk-actions'
import { useToast } from '@/hooks/use-toast'

interface DemoProductsPageProps {
  products: Product[]
}

export default function DemoProductsPage({ products }: DemoProductsPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [productLocation, setProductLocation] = useState<Location | null>(null)
  const { toast } = useToast()

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <ImportProductsDialog environmentId="demo" />
          <Link href="/demo/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Product Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage products for the demo environment. You can add, edit, and track the status of products here.
            </p>
          </div>
        </div>
        
        <DataTable 
          columns={columns} 
          data={products} 
          onBulkAction={handleBulkActionWrapper}
          onRowClick={handleRowClick}
        />
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        location={productLocation}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  )
}

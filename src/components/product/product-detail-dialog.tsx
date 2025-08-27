'use client'

import { useState } from 'react'
import { Product, Location } from '@/types/db'
import { statuses } from '@/components/data-table/data'
import { CategoryDisplay } from '@/components/product/category-display'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  MapPin, 
  Tag, 
  DollarSign, 
  Package, 
  Image as ImageIcon,
  ExternalLink,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface ProductDetailDialogProps {
  product: Product | null
  location?: Location | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ 
  product, 
  location, 
  open, 
  onOpenChange 
}: ProductDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!product) {
    return null
  }

  const status = statuses.find(s => s.value === product.status)

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{product.title}</DialogTitle>
              <DialogDescription>
                Product ID: {product.id}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/demo/products/${product.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-lg font-medium">{product.title}</p>
                  </div>
                  
                  {product.sku && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">SKU</label>
                      <p className="font-mono">{product.sku}</p>
                    </div>
                  )}
                  
                  {product.barcode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                      <p className="font-mono">{product.barcode}</p>
                    </div>
                  )}
                  
                  {product.external_id && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">External ID</label>
                      <p className="font-mono">{product.external_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Status & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      {status && (
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{location.name}</p>
                      </div>
                      {location.description && (
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{formatDate(product.status_updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {product.categories && product.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryDisplay 
                    categories={product.categories} 
                    showFullPath={true}
                    maxDisplay={10}
                  />
                </CardContent>
              </Card>
            )}

            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {product.product_type && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                      <p>{product.product_type}</p>
                    </div>
                  )}
                  
                  {product.short_description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                      <p>{product.short_description}</p>
                    </div>
                  )}
                  
                  {product.gtin && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">GTIN</label>
                      <p className="font-mono">{product.gtin}</p>
                    </div>
                  )}
                  
                  {product.upc && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">UPC</label>
                      <p className="font-mono">{product.upc}</p>
                    </div>
                  )}
                  
                  {product.ean && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">EAN</label>
                      <p className="font-mono">{product.ean}</p>
                    </div>
                  )}
                  
                  {product.isbn && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ISBN</label>
                      <p className="font-mono">{product.isbn}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {product.tags && product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {product.purchase_price && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                      <p className="text-2xl font-bold">{formatPrice(product.purchase_price)}</p>
                    </div>
                  )}
                  
                  {product.selling_price && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                      <p className="text-2xl font-bold">{formatPrice(product.selling_price)}</p>
                    </div>
                  )}
                  
                  {product.sold_price && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sold Price</label>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(product.sold_price)}</p>
                      {product.sold_at && (
                        <p className="text-sm text-muted-foreground">
                          Sold on {formatDate(product.sold_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{formatDate(product.created_at)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm">{formatDate(product.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Product Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                    <p className="text-xs text-muted-foreground">Images will appear here when uploaded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

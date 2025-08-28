'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ProductImages } from '@/components/product/product-images'
import { Product, Location, ProductImage } from '@/types/db'
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Tag, 
  Edit,
  X
} from 'lucide-react'
import Link from 'next/link'

// Client-side function to fetch product images
async function getProductImagesClient(productId: string): Promise<ProductImage[]> {
  try {
    const response = await fetch(`/api/products/${productId}/images`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error fetching product images:', error)
    return []
  }
}

interface ProductDetailDialogProps {
  product: Product
  location: Location | null
  open: boolean
  onOpenChange: (open: boolean) => void
  environmentSlug?: string
}

export function ProductDetailDialog({ 
  product, 
  location, 
  open, 
  onOpenChange,
  environmentSlug
}: ProductDetailDialogProps) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  // Fetch images when dialog opens
  useEffect(() => {
    if (open && product.id) {
      setIsLoadingImages(true)
      getProductImagesClient(product.id)
        .then(setImages)
        .catch(error => {
          console.error('Error fetching product images:', error)
        })
        .finally(() => {
          setIsLoadingImages(false)
        })
    }
  }, [open, product.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return 'bg-blue-100 text-blue-800'
      case 'in_repair':
        return 'bg-yellow-100 text-yellow-800'
      case 'selling':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-purple-100 text-purple-800'
      case 'returned':
        return 'bg-red-100 text-red-800'
      case 'discarded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Product ID: {product.id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {environmentSlug && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${environmentSlug}/products/${product.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
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
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-lg font-semibold">{product.title}</p>
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
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {location ? (
                    <div className="space-y-2">
                      <p className="font-semibold">{location.name}</p>
                      {location.description && (
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                      )}
                      {location.address && (
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No location assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {product.categories && product.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {product.external_id && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">External ID</label>
                      <p className="font-mono">{product.external_id}</p>
                    </div>
                  )}
                  
                  {product.product_type && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                      <p>{product.product_type}</p>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </CardTitle>
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
            <ProductImages
              productId={product.id}
              images={images}
              onImagesUpdate={() => {
                // Refresh images when they're updated
                getProductImagesClient(product.id)
                  .then(setImages)
                  .catch(error => {
                    console.error('Error refreshing product images:', error)
                  })
              }}
              canEdit={true}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

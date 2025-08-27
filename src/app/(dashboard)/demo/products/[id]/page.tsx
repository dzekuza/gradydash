import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { createClient } from '@/lib/supabase/client-server'
import { statuses } from '@/components/data-table/data'

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = createClient()
  
  // Get the demo environment ID
  const demoEnvironmentId = await getDemoEnvironmentId()
  
  // Fetch the product with location information
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      environment_id,
      title,
      sku,
      barcode,
      description,
      status,
      location_id,
      purchase_price,
      selling_price,
      sold_price,
      sold_at,
      status_updated_at,
      created_at,
      updated_at,
      locations (
        id,
        name,
        description,
        address
      )
    `)
    .eq('id', params.id)
    .eq('environment_id', demoEnvironmentId)
    .single()

  if (error || !product) {
    notFound()
  }

  const status = statuses.find(s => s.value === product.status)
  const location = product.locations?.[0] // Get the first location since it's an array

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Link href="/demo/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{product.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/demo/products/${product.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-lg">{product.title}</p>
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
            
            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p>{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <p className="font-medium">{location.name}</p>
                {location.description && (
                  <p className="text-sm text-muted-foreground">{location.description}</p>
                )}
                {location.address && (
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status Updated</label>
              <p className="text-sm">{new Date(product.status_updated_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {product.purchase_price && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Purchase Price</label>
                <p className="text-lg font-medium">
                  €{product.purchase_price.toFixed(2)}
                </p>
              </div>
            )}
            
            {product.selling_price && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                <p className="text-lg font-medium">
                  €{product.selling_price.toFixed(2)}
                </p>
              </div>
            )}
            
            {product.sold_price && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sold Price</label>
                <p className="text-lg font-medium text-green-600">
                  €{product.sold_price.toFixed(2)}
                </p>
                {product.sold_at && (
                  <p className="text-sm text-muted-foreground">
                    Sold on {new Date(product.sold_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{new Date(product.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{new Date(product.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

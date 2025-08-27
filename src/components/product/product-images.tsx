'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/product/image-upload'
import { uploadProductImages, deleteProductImage } from '@/lib/db/products/upload-product-images'
import { ProductImage } from '@/types/db'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProductImagesProps {
  productId: string
  images: ProductImage[]
  onImagesUpdate: () => void
  canEdit?: boolean
}

export function ProductImages({ 
  productId, 
  images, 
  onImagesUpdate, 
  canEdit = true 
}: ProductImagesProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const { toast } = useToast()

  const handleUploadImages = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    try {
      await uploadProductImages(productId, files)
      toast({
        title: 'Images uploaded',
        description: `${files.length} image(s) uploaded successfully.`,
      })
      onImagesUpdate()
      setShowUpload(false)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setIsDeleting(imageId)
    try {
      await deleteProductImage(imageId)
      toast({
        title: 'Image deleted',
        description: 'Image has been removed successfully.',
      })
      onImagesUpdate()
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete image',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (images.length === 0 && !showUpload) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images
          </h3>
          {canEdit && (
            <Button
              onClick={() => setShowUpload(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Images
            </Button>
          )}
        </div>

        {showUpload ? (
          <ImageUpload
            onImagesChange={handleUploadImages}
            maxFiles={5}
            maxFileSize={5}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No images uploaded yet
              </p>
              <p className="text-sm text-muted-foreground">
                Images will appear here when uploaded
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Product Images ({images.length})
        </h3>
        {canEdit && (
          <Button
            onClick={() => setShowUpload(!showUpload)}
            size="sm"
            variant={showUpload ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {showUpload ? 'Cancel' : 'Upload More'}
          </Button>
        )}
      </div>

      {showUpload && (
        <ImageUpload
          onImagesChange={handleUploadImages}
          maxFiles={5}
          maxFileSize={5}
          acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
        />
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={image.public_url}
                  alt={image.file_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {canEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={isDeleting === image.id}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {image.file_name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

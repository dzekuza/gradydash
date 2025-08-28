'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void
  onSave?: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  showSaveButton?: boolean
}

interface ImagePreview {
  id: string
  file: File
  preview: string
}

export function ImageUpload({
  onImagesChange,
  onSave,
  maxFiles = 5,
  maxFileSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className,
  showSaveButton = false
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }
    
    return null
  }, [acceptedTypes, maxFileSize])

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
      return
    }

    if (previews.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    setError(null)

    const newPreviews: ImagePreview[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }))

    setPreviews(prev => [...prev, ...newPreviews])
    
    // Only call onImagesChange if showSaveButton is false (auto-upload mode)
    if (!showSaveButton) {
      onImagesChange([...previews.map(p => p.file), ...validFiles])
    }
  }, [previews, maxFiles, validateFile, onImagesChange, showSaveButton])

  const removeImage = useCallback((id: string) => {
    setPreviews(prev => {
      const newPreviews = prev.filter(p => p.id !== id)
      // Only call onImagesChange if showSaveButton is false (auto-upload mode)
      if (!showSaveButton) {
        onImagesChange(newPreviews.map(p => p.file))
      }
      return newPreviews
    })
  }, [onImagesChange, showSaveButton])

  const handleSave = useCallback(async () => {
    if (previews.length === 0) return
    
    setIsUploading(true)
    try {
      const files = previews.map(p => p.file)
      if (onSave) {
        await onSave(files)
      } else {
        onImagesChange(files)
      }
      // Clear previews after successful upload
      setPreviews([])
    } catch (error) {
      console.error('Error saving images:', error)
    } finally {
      setIsUploading(false)
    }
  }, [previews, onSave, onImagesChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      addFiles(files)
    }
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <Label>Product Images</Label>
      
      {/* Drag and Drop Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          previews.length === 0 && 'h-32'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {previews.length === 0 ? (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop images here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedTypes.join(', ').replace('image/', '')} up to {maxFileSize}MB each
              </p>
            </>
          ) : (
            <div className="w-full">
              <p className="text-sm text-muted-foreground mb-4">
                {previews.length} of {maxFiles} images selected
              </p>
              
              {/* Image Previews */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview) => (
                  <div key={preview.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                      <Image
                        src={preview.preview}
                        alt={preview.file.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(preview.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {preview.file.name}
                    </p>
                  </div>
                ))}
                
                {previews.length < maxFiles && (
                  <div 
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    onClick={handleClick}
                  >
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Add more</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {showSaveButton && previews.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Upload up to {maxFiles} images. Supported formats: {acceptedTypes.join(', ').replace('image/', '')}. 
        Maximum file size: {maxFileSize}MB per image.
      </p>
    </div>
  )
}

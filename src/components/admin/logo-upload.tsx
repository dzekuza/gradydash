'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Image, Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LogoUploadProps {
  onLogoChange: (file: File | null) => void
  disabled?: boolean
}

export function LogoUpload({ onLogoChange, disabled = false }: LogoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or SVG)')
      return
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB')
      return
    }

    setSelectedFile(file)
    onLogoChange(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleRemoveLogo = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    onLogoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logo">Partner Logo (Optional)</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Upload a logo for this partner. Recommended size: 200x200px. Max 2MB.
        </p>
      </div>

      {!selectedFile ? (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="logo-upload"
            className={cn(
              "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
              "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP, SVG up to 2MB</p>
            </div>
            <Input
              id="logo-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

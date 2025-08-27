'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { importProductsFromCSV } from '@/lib/db/products/import-products'

interface ImportProductsDialogProps {
  environmentId: string
}

interface CSVProduct {
  title: string
  sku?: string
  barcode?: string
  description?: string
  status: 'taken' | 'in_repair' | 'selling' | 'sold' | 'returned' | 'discarded'
  purchase_price?: number
  selling_price?: number
  location_name?: string
}

export function ImportProductsDialog({ environmentId }: ImportProductsDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<CSVProduct[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file',
        variant: 'destructive',
      })
      return
    }

    setFile(selectedFile)
    setErrors([])
    setPreview([])

    try {
      const text = await selectedFile.text()
      const products = parseCSV(text)
      setPreview(products.slice(0, 5)) // Show first 5 rows as preview
    } catch (error) {
      toast({
        title: 'Error reading file',
        description: 'Could not read the CSV file. Please check the format.',
        variant: 'destructive',
      })
    }
  }

  const parseCSV = (csvText: string): CSVProduct[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredHeaders = ['title', 'status']
    
    // Check for required headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    const products: CSVProduct[] = []
    const validationErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(',').map(v => v.trim())
      
      if (values.length < headers.length) {
        validationErrors.push(`Row ${i + 1}: Insufficient columns`)
        continue
      }

      const product: any = {}
      headers.forEach((header, index) => {
        product[header] = values[index] || undefined
      })

      // Validate required fields
      if (!product.title?.trim()) {
        validationErrors.push(`Row ${i + 1}: Title is required`)
        continue
      }

      // Validate status
      const validStatuses = ['taken', 'in_repair', 'selling', 'sold', 'returned', 'discarded']
      if (!validStatuses.includes(product.status)) {
        validationErrors.push(`Row ${i + 1}: Invalid status. Must be one of: ${validStatuses.join(', ')}`)
        continue
      }

      // Parse numeric fields
      if (product.purchase_price) {
        const price = parseFloat(product.purchase_price)
        if (isNaN(price) || price < 0) {
          validationErrors.push(`Row ${i + 1}: Invalid purchase price`)
          continue
        }
        product.purchase_price = price
      }

      if (product.selling_price) {
        const price = parseFloat(product.selling_price)
        if (isNaN(price) || price < 0) {
          validationErrors.push(`Row ${i + 1}: Invalid selling price`)
          continue
        }
        product.selling_price = price
      }

      products.push(product as CSVProduct)
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      throw new Error(`Validation errors found: ${validationErrors.length} errors`)
    }

    return products
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const products = parseCSV(text)
      
      const formData = new FormData()
      formData.append('environmentId', environmentId)
      formData.append('products', JSON.stringify(products))

      await importProductsFromCSV(formData)

      toast({
        title: 'Import successful',
        description: `Successfully imported ${products.length} products`,
      })

      setFile(null)
      setPreview([])
      setErrors([])
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import products',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `title,sku,barcode,description,status,purchase_price,selling_price,location_name
"iPhone 13 Pro","IP13P001","1234567890123","Excellent condition iPhone 13 Pro",taken,800.00,1200.00,"Main Store"
"MacBook Air M1","MBA001","9876543210987","Like new MacBook Air",selling,900.00,1400.00,"Online Store"`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple products at once. 
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal text-primary"
              onClick={downloadTemplate}
            >
              Download template
            </Button>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Required columns: title, status. Optional: sku, barcode, description, purchase_price, selling_price, location_name
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Validation errors found:</p>
                  <ul className="text-sm space-y-1">
                    {errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>• ... and {errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (first 5 rows)</Label>
              <div className="border rounded-md p-3 bg-muted/50">
                <div className="space-y-2">
                  {preview.map((product, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{product.title}</span>
                      <span className="text-muted-foreground">({product.status})</span>
                      {product.sku && (
                        <span className="text-muted-foreground">SKU: {product.sku}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading || errors.length > 0}
          >
            {isLoading ? 'Importing...' : 'Import Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

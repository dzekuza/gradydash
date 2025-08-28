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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, AlertCircle, CheckCircle, Map } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { importProducts } from '@/lib/db/products/import-products'
import { getAllCategories } from '@/lib/utils/categories'

interface ImportProductsDialogProps {
  environmentId: string
}

interface CSVProduct {
  id?: string
  type?: string
  sku?: string
  gtin?: string
  upc?: string
  ean?: string
  isbn?: string
  name: string
  short_description?: string
  description?: string
  in_stock?: boolean
  categories?: string
  tags?: string
  images?: string
  status: 'taken' | 'in_repair' | 'selling' | 'sold' | 'returned' | 'discarded'
  purchase_price?: number
  selling_price?: number
  location_name?: string
}

interface FieldMapping {
  [csvColumn: string]: string
}

const APP_FIELDS = [
  { value: 'name', label: 'Product Name (Required)', required: true },
  { value: 'status', label: 'Status (Required)', required: true },
  { value: 'id', label: 'External ID', required: false },
  { value: 'type', label: 'Product Type', required: false },
  { value: 'sku', label: 'SKU', required: false },
  { value: 'gtin', label: 'GTIN', required: false },
  { value: 'upc', label: 'UPC', required: false },
  { value: 'ean', label: 'EAN', required: false },
  { value: 'isbn', label: 'ISBN', required: false },
  { value: 'short_description', label: 'Short Description', required: false },
  { value: 'description', label: 'Description', required: false },
  { value: 'purchase_price', label: 'Purchase Price', required: false },
  { value: 'selling_price', label: 'Selling Price', required: false },
  { value: 'categories', label: 'Categories', required: false },
  { value: 'tags', label: 'Tags', required: false },
  { value: 'location_name', label: 'Location Name', required: false },
  { value: 'in_stock', label: 'In Stock', required: false },
  { value: 'images', label: 'Images', required: false },
]

export function ImportProductsDialog({ environmentId }: ImportProductsDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<CSVProduct[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({})
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview'>('upload')
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
    setFieldMapping({})

    try {
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header and one data row')
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      setCsvHeaders(headers)

      // Auto-map common field names
      const autoMapping: FieldMapping = {}
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        
        // Auto-map common variations
        if (lowerHeader.includes('name') || lowerHeader.includes('title') || lowerHeader.includes('product')) {
          autoMapping[header] = 'name'
        } else if (lowerHeader.includes('status') || lowerHeader.includes('condition')) {
          autoMapping[header] = 'status'
        } else if (lowerHeader.includes('price') && lowerHeader.includes('purchase')) {
          autoMapping[header] = 'purchase_price'
        } else if (lowerHeader.includes('price') && lowerHeader.includes('sell')) {
          autoMapping[header] = 'selling_price'
        } else if (lowerHeader.includes('sku')) {
          autoMapping[header] = 'sku'
        } else if (lowerHeader.includes('category')) {
          autoMapping[header] = 'categories'
        } else if (lowerHeader.includes('tag')) {
          autoMapping[header] = 'tags'
        } else if (lowerHeader.includes('location')) {
          autoMapping[header] = 'location_name'
        } else if (lowerHeader.includes('description')) {
          autoMapping[header] = 'description'
        }
      })

      setFieldMapping(autoMapping)
      setCurrentStep('mapping')
    } catch (error) {
      toast({
        title: 'Error reading file',
        description: 'Could not read the CSV file. Please check the format.',
        variant: 'destructive',
      })
    }
  }

  const handleMappingChange = (csvColumn: string, appField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvColumn]: appField
    }))
  }

  const validateMapping = () => {
    const requiredFields = ['name', 'status']
    const missingFields = requiredFields.filter(field => 
      !Object.values(fieldMapping).includes(field)
    )

    if (missingFields.length > 0) {
      setErrors([`Missing required field mappings: ${missingFields.join(', ')}`])
      return false
    }

    setErrors([])
    return true
  }

  const handlePreview = () => {
    if (!validateMapping()) return

    try {
      const text = file?.text()
      if (!text) return

      text.then(csvText => {
        const products = parseCSV(csvText)
        setPreview(products.slice(0, 5))
        setCurrentStep('preview')
      })
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Could not parse the CSV file with current mapping.',
        variant: 'destructive',
      })
    }
  }

  const parseCSV = (csvText: string): CSVProduct[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const products: CSVProduct[] = []
    const validationErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      
      // Skip empty rows
      if (values.length === 0 || (values.length === 1 && values[0] === '')) {
        continue
      }

      const product: any = {}
      
      // Map CSV values to app fields using fieldMapping
      headers.forEach((header, index) => {
        const appField = fieldMapping[header]
        if (appField && appField !== 'skip') {
          // Only set the value if the index exists in the values array
          if (index < values.length) {
            product[appField] = values[index] || undefined
          }
        }
      })

      // Validate required fields
      if (!product.name?.trim()) {
        validationErrors.push(`Row ${i + 1}: Name is required`)
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

      // Parse boolean field
      if (product.in_stock !== undefined) {
        product.in_stock = product.in_stock.toLowerCase() === 'true' || product.in_stock === '1' || product.in_stock === 'yes'
      }

      // Parse array fields
      if (product.categories) {
        const categoryIds = product.categories.split(';').map((cat: string) => cat.trim()).filter(Boolean)
        // Validate category IDs against our category system
        const validCategories = getAllCategories().map(cat => cat.id)
        const invalidCategories = categoryIds.filter((id: string) => !validCategories.includes(id))
        if (invalidCategories.length > 0) {
          validationErrors.push(`Row ${i + 1}: Invalid category IDs: ${invalidCategories.join(', ')}`)
          continue
        }
        product.categories = categoryIds
      }

      if (product.tags) {
        product.tags = product.tags.split(';').map((tag: string) => tag.trim()).filter(Boolean)
      }

      products.push(product as CSVProduct)
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      // Don't throw an error, just return empty array and let the UI show the errors
      return []
    }

    return products
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const csvProducts = parseCSV(text)
      
      // Transform CSVProduct[] to ImportProduct[]
      const transformedProducts = csvProducts.map(product => ({
        title: product.name,
        sku: product.sku,
        barcode: product.gtin || product.upc || product.ean || product.isbn,
        description: product.description || product.short_description,
        status: product.status,
        location_id: undefined, // Will be mapped by location name later
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        categories: Array.isArray(product.categories) ? product.categories : undefined,
        tags: Array.isArray(product.tags) ? product.tags : undefined
      }))
      
      await importProducts(transformedProducts, environmentId)

      toast({
        title: 'Import successful',
        description: `Successfully imported ${transformedProducts.length} products`,
      })

      setFile(null)
      setPreview([])
      setErrors([])
      setFieldMapping({})
      setCurrentStep('upload')
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
    const template = `Product Name,Status,Purchase Price,Selling Price,SKU,Description,Location
"iPhone 13 Pro","taken","800.00","1200.00","IP13P001","Excellent condition iPhone 13 Pro with 256GB storage","Main Store"
"MacBook Air M1","selling","900.00","1400.00","MBA001","Like new MacBook Air with M1 chip","Online Store"
"Samsung Galaxy S21","in_repair","600.00","900.00","SGS21-001","Good condition Samsung Galaxy S21 with 128GB storage","Repair Center"`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetImport = () => {
    setFile(null)
    setPreview([])
    setErrors([])
    setCsvHeaders([])
    setFieldMapping({})
    setCurrentStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file and map the columns to product fields. 
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal text-primary"
              onClick={downloadTemplate}
            >
              Download template
            </Button>
            <br />
            <span className="text-xs text-muted-foreground">
              Required fields: Product Name, Status. Valid statuses: taken, in_repair, selling, sold, returned, discarded
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
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
                Upload your CSV file. The next step will allow you to map columns to product fields.
              </p>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {currentStep === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <Label>Map CSV Columns to Product Fields</Label>
              </div>
              
              <div className="grid gap-3">
                {csvHeaders.map((csvColumn) => (
                  <div key={csvColumn} className="flex items-center gap-3">
                                         <div className="flex-1">
                       <Label className="text-sm font-medium">&quot;{csvColumn}&quot;</Label>
                     </div>
                    <div className="flex-1">
                      <Select
                        value={fieldMapping[csvColumn] || 'skip'}
                        onValueChange={(value) => handleMappingChange(csvColumn, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="skip">Skip this column</SelectItem>
                          {APP_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label} {field.required && '*'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Mapping errors:</p>
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
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Label>Preview (first 5 rows)</Label>
              </div>
              
              <div className="border rounded-md p-3 bg-muted/50">
                <div className="space-y-2">
                  {preview.map((product, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground">({product.status})</span>
                      {product.sku && (
                        <span className="text-muted-foreground">SKU: {product.sku}</span>
                      )}
                      {product.purchase_price && (
                        <span className="text-muted-foreground">€{product.purchase_price}</span>
                      )}
                    </div>
                  ))}
                </div>
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
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          
          {currentStep === 'mapping' && (
            <Button onClick={handlePreview}>
              Preview Import
            </Button>
          )}
          
          {currentStep === 'preview' && (
            <Button 
              onClick={handleImport} 
              disabled={!file || isLoading || errors.length > 0}
            >
              {isLoading ? 'Importing...' : 'Import Products'}
            </Button>
          )}
          
          {(currentStep === 'mapping' || currentStep === 'preview') && (
            <Button type="button" variant="outline" onClick={resetImport}>
              Start Over
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

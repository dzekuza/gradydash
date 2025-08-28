'use client'

import React, { useState, useEffect } from 'react'
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
import { ProductForm } from '@/components/product/product-form'
import { Location } from '@/types/db'
import { Plus } from 'lucide-react'

interface ProductDialogProps {
  locations: Location[]
  environmentId: string
  environments?: Array<{ id: string; name: string; slug: string; description?: string }>
}

export function ProductDialog({ locations, environmentId, environments }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Listen for the custom event from ProductForm
  useEffect(() => {
    const handleFormSuccess = () => {
      setOpen(false)
      router.refresh()
    }

    window.addEventListener('productFormSuccess', handleFormSuccess)
    
    return () => {
      window.removeEventListener('productFormSuccess', handleFormSuccess)
    }
  }, [router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details to add it to your inventory.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ProductForm
            locations={locations}
            environmentId={environmentId}
            environments={environments}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            inDialog={true}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            form="product-form" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

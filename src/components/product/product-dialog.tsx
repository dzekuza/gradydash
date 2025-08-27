'use client'

import { useState } from 'react'
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
}

export function ProductDialog({ locations, environmentId }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            onSuccess={handleSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

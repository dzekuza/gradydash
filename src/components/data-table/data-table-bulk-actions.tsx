'use client'

import { useState } from 'react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CategorySelector } from '@/components/product/category-selector'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  DollarSign,
  RotateCcw,
  X
} from 'lucide-react'
import { Product, ProductStatus } from '@/types/db'
import { useToast } from '@/hooks/use-toast'

interface DataTableBulkActionsProps<TData> {
  table: Table<TData>
  onBulkAction: (action: string, data: any) => Promise<void>
}

const statusOptions: { value: ProductStatus; label: string; icon: any }[] = [
  { value: 'taken', label: 'Taken', icon: CheckCircle },
  { value: 'in_repair', label: 'In Repair', icon: Clock },
  { value: 'selling', label: 'Selling', icon: ShoppingCart },
  { value: 'sold', label: 'Sold', icon: DollarSign },
  { value: 'returned', label: 'Returned', icon: RotateCcw },
  { value: 'discarded', label: 'Discarded', icon: X },
]

export function DataTableBulkActions<TData>({
  table,
  onBulkAction,
}: DataTableBulkActionsProps<TData>) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false)
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>('taken')
  const [newTags, setNewTags] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  const handleBulkStatusUpdate = async () => {
    setIsLoading(true)
    try {
      const productIds = selectedRows.map(row => (row.original as Product).id)
      await onBulkAction('updateStatus', { productIds, status: selectedStatus })
      setIsStatusDialogOpen(false)
      toast({
        title: 'Status Updated',
        description: `Updated status for ${selectedCount} products`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkTagsUpdate = async () => {
    setIsLoading(true)
    try {
      const productIds = selectedRows.map(row => (row.original as Product).id)
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean)
      await onBulkAction('updateTags', { productIds, tags })
      setIsTagsDialogOpen(false)
      setNewTags('')
      toast({
        title: 'Tags Updated',
        description: `Updated tags for ${selectedCount} products`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product tags',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkCategoriesUpdate = async () => {
    setIsLoading(true)
    try {
      const productIds = selectedRows.map(row => (row.original as Product).id)
      await onBulkAction('updateCategories', { productIds, categories: selectedCategories })
      setIsCategoriesDialogOpen(false)
      setSelectedCategories([])
      toast({
        title: 'Categories Updated',
        description: `Updated categories for ${selectedCount} products`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product categories',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    setIsLoading(true)
    try {
      const productIds = selectedRows.map(row => (row.original as Product).id)
      await onBulkAction('delete', { productIds })
      setIsDeleteDialogOpen(false)
      toast({
        title: 'Products Deleted',
        description: `Deleted ${selectedCount} products`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete products',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsTagsDialogOpen(true)}>
              <Tag className="mr-2 h-4 w-4" />
              Update Tags
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsCategoriesDialogOpen(true)}>
              <Tag className="mr-2 h-4 w-4" />
              Update Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Products
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedCount} selected products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={selectedStatus} onValueChange={(value: ProductStatus) => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <status.icon className="h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Update Dialog */}
      <Dialog open={isTagsDialogOpen} onOpenChange={setIsTagsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tags</DialogTitle>
            <DialogDescription>
              Update tags for {selectedCount} selected products. Separate multiple tags with commas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkTagsUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Tags'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Update Dialog */}
      <Dialog open={isCategoriesDialogOpen} onOpenChange={setIsCategoriesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Categories</DialogTitle>
            <DialogDescription>
              Update categories for {selectedCount} selected products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categories</Label>
              <CategorySelector
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                placeholder="Select categories..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoriesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCategoriesUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Categories'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} selected products? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              This will permanently delete {selectedCount} products from the database.
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete} 
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Products'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

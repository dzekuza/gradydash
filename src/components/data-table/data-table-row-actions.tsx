"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Product } from "@/types/db"
import { statuses } from "./data"
import { deleteProductAction } from "@/lib/db/products/delete-product-action"
import { updateProductStatus } from "@/lib/db/products/update-product-status"
import { useToast } from "@/hooks/use-toast"

interface DataTableRowActionsProps {
  row: Row<Product>
  environmentSlug?: string
}

export function DataTableRowActions({ row, environmentSlug }: DataTableRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const product = row.original
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    if (environmentSlug) {
      router.push(`/${environmentSlug}/products/${product.id}/edit`)
    }
  }

  const handleView = () => {
    if (environmentSlug) {
      router.push(`/${environmentSlug}/products/${product.id}`)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!environmentSlug) {
      toast({
        title: "Error",
        description: "Environment not found",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingStatus(true)
    try {
      await updateProductStatus(product.id, newStatus, environmentSlug)
      toast({
        title: "Status updated",
        description: `Product status changed to ${newStatus}.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!environmentSlug) {
      toast({
        title: "Error",
        description: "Environment not found",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)
    try {
      await deleteProductAction(product.id, environmentSlug)
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            data-action="row-menu"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleEdit} data-action="edit">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleView} data-action="view">
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup 
                value={product.status}
                onValueChange={handleStatusChange}
              >
                {statuses.map((status) => (
                  <DropdownMenuRadioItem
                    key={status.value}
                    value={status.value}
                    disabled={isUpdatingStatus}
                  >
                    {status.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
            data-action="delete"
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the product
              &quot;{product.title}&quot; and remove it from your inventory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Product } from "@/types/db"

export const statuses = [
  {
    value: "taken",
    label: "Taken",
    variant: "secondary" as const,
  },
  {
    value: "in_repair",
    label: "In Repair",
    variant: "outline" as const,
  },
  {
    value: "selling",
    label: "Selling",
    variant: "default" as const,
  },
  {
    value: "sold",
    label: "Sold",
    variant: "default" as const,
  },
  {
    value: "returned",
    label: "Returned",
    variant: "destructive" as const,
  },
  {
    value: "discarded",
    label: "Discarded",
    variant: "destructive" as const,
  },
]

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[300px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "sku",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SKU" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100px] truncate font-mono text-sm">
            {row.getValue("sku") || "N/A"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "purchase_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purchase Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("purchase_price") || "0")
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "selling_price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Selling Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("selling_price") || "0")
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>
            {new Date(row.getValue("created_at")).toLocaleDateString()}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

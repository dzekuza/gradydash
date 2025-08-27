import { z } from 'zod'
import { ProductStatus } from '@/types/db'

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['taken', 'in_repair', 'selling', 'sold', 'returned', 'discarded'] as const),
  location_id: z.string().uuid().optional(),
  purchase_price: z.number().positive().optional(),
  selling_price: z.number().positive().optional(),
})

export const updateProductSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  location_id: z.string().uuid().optional(),
  purchase_price: z.number().positive().optional(),
  selling_price: z.number().positive().optional(),
})

export const changeProductStatusSchema = z.object({
  product_id: z.string().uuid(),
  to_status: z.enum(['taken', 'in_repair', 'selling', 'sold', 'returned', 'discarded'] as const),
  note: z.string().optional(),
})

export const addProductCommentSchema = z.object({
  product_id: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required'),
})

export const recordSaleSchema = z.object({
  product_id: z.string().uuid(),
  amount: z.number().positive('Sale amount must be positive'),
  currency: z.string().default('EUR'),
})

export const uploadProductImageSchema = z.object({
  product_id: z.string().uuid(),
  file: z.instanceof(File),
})

import { z } from 'zod'

export const environmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
})

export const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  slug: z.string().min(1, 'Environment slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
})

export const updateEnvironmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
})

export const environmentInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'store_manager'] as const),
  environmentId: z.string().uuid('Invalid environment ID')
})

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  contact_person_name: z.string().optional(),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
})

export const inviteUserSchema = z.object({
  environment_id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'store_manager'] as const),
})

export const acceptInviteSchema = z.object({
  invite_id: z.string().uuid(),
})

export type EnvironmentFormData = z.infer<typeof environmentSchema>
export type CreateEnvironmentFormData = z.infer<typeof createEnvironmentSchema>
export type UpdateEnvironmentFormData = z.infer<typeof updateEnvironmentSchema>
export type EnvironmentInviteFormData = z.infer<typeof environmentInviteSchema>

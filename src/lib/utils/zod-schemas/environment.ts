import { z } from 'zod'

export const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  slug: z.string().min(1, 'Environment slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
})

export const inviteUserSchema = z.object({
  environment_id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['grady_admin', 'grady_staff', 'reseller_manager', 'reseller_staff'] as const),
})

export const acceptInviteSchema = z.object({
  invite_id: z.string().uuid(),
})

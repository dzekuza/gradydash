import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'store_manager'] as const),
  environmentId: z.string().uuid('Invalid environment ID')
})

export type InviteFormData = z.infer<typeof inviteSchema>

export const acceptInviteSchema = z.object({
  invite_id: z.string().uuid(),
})

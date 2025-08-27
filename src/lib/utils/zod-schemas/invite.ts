import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'store_manager'] as const),
  environment_id: z.string().uuid().nullable(),
})

export const acceptInviteSchema = z.object({
  invite_id: z.string().uuid(),
})

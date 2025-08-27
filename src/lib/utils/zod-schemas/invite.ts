import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['grady_admin', 'grady_staff', 'reseller_manager', 'reseller_staff'] as const),
  environment_id: z.string().uuid(),
})

export const acceptInviteSchema = z.object({
  invite_id: z.string().uuid(),
})

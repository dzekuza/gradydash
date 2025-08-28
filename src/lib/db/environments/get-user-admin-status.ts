'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface AdminStatus {
  isSystemAdmin: boolean
  isEnvironmentAdmin: boolean
  canCreateEnvironments: boolean
}

export async function getUserAdminStatus(userId: string): Promise<AdminStatus> {
  const supabase = createClient()
  
  // Use service client to bypass RLS for admin status checks
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check for system admin membership (null partner_id)
  const { data: systemMembership, error: systemError } = await serviceClient
    .from('memberships')
    .select('role, partner_id')
    .eq('user_id', userId)
    .is('partner_id', null)
    .single()

  if (systemError && systemError.code !== 'PGRST116') {
    console.error('Error checking system admin status:', systemError)
  }

  // Check for environment admin membership
  const { data: environmentMembership, error: envError } = await serviceClient
    .from('memberships')
    .select('role, partner_id')
    .eq('user_id', userId)
    .not('partner_id', 'is', null)
    .eq('role', 'admin')
    .single()

  if (envError && envError.code !== 'PGRST116') {
    console.error('Error checking environment admin status:', envError)
  }

  const isSystemAdmin = !!systemMembership && systemMembership.role === 'admin'
  const isEnvironmentAdmin = !!environmentMembership
  const canCreateEnvironments = isSystemAdmin

  return {
    isSystemAdmin,
    isEnvironmentAdmin,
    canCreateEnvironments
  }
}

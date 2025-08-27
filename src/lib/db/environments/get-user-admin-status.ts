'use server'

import { createClient } from '@/lib/supabase/client-server'

export interface AdminStatus {
  isSystemAdmin: boolean
  isEnvironmentAdmin: boolean
  canCreateEnvironments: boolean
}

export async function getUserAdminStatus(userId: string): Promise<AdminStatus> {
  const supabase = createClient()

  // Check for system admin membership (null environment_id)
  const { data: systemMembership, error: systemError } = await supabase
    .from('memberships')
    .select('role, environment_id')
    .eq('user_id', userId)
    .is('environment_id', null)
    .single()

  if (systemError && systemError.code !== 'PGRST116') {
    console.error('Error checking system admin status:', systemError)
  }

  // Check for environment admin membership
  const { data: environmentMembership, error: envError } = await supabase
    .from('memberships')
    .select('role, environment_id')
    .eq('user_id', userId)
    .not('environment_id', 'is', null)
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

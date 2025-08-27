'use server'

import { createClient } from '@/lib/supabase/client-server'

export async function getUserAdminStatus(userId: string) {
  const supabase = createClient()

  try {
    // Check if user has system-wide admin membership (null environment_id)
    const { data: systemMembership, error: systemError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .is('environment_id', null)
      .single()

    if (systemError && systemError.code !== 'PGRST116') {
      console.error('Error checking system admin status:', systemError)
      throw new Error('Failed to check admin status')
    }

    const isSystemAdmin = !!systemMembership && ['grady_admin', 'grady_staff'].includes(systemMembership.role)

    return {
      isSystemAdmin,
      role: systemMembership?.role || null
    }
  } catch (error) {
    console.error('Error in getUserAdminStatus:', error)
    throw error
  }
}

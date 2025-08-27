'use server'

import { createClient } from '@/lib/supabase/client-server'

export interface UserRoutingInfo {
  isSystemAdmin: boolean
  hasEnvironments: boolean
  firstEnvironmentSlug?: string
  redirectTo: string
}

export async function getUserRoutingInfo(userId: string): Promise<UserRoutingInfo> {
  const supabase = createClient()

  try {
    // Get user's memberships to determine routing
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select(`
        environment_id,
        role,
        environments (
          slug
        )
      `)
      .eq('user_id', userId)

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError)
      throw new Error('Failed to fetch user memberships')
    }

    // Check if user is a system admin (has membership with null environment_id)
    const systemMembership = memberships?.find(m => m.environment_id === null)
    const isSystemAdmin = !!systemMembership && systemMembership.role === 'admin'
    const hasEnvironments = memberships && memberships.length > 0

    // Get the first environment slug for redirect
    const firstEnvironment = memberships?.find(m => m.environment_id !== null)
    const firstEnvironmentSlug = (firstEnvironment?.environments as any)?.slug

    // Determine redirect destination
    let redirectTo = '/dashboard'
    
    if (isSystemAdmin) {
      redirectTo = '/admin'
    } else if (hasEnvironments && firstEnvironmentSlug) {
      redirectTo = `/${firstEnvironmentSlug}`
    } else {
      redirectTo = '/demo'
    }

    return {
      isSystemAdmin,
      hasEnvironments,
      firstEnvironmentSlug,
      redirectTo
    }
  } catch (error) {
    console.error('Error in getUserRoutingInfo:', error)
    throw error
  }
}

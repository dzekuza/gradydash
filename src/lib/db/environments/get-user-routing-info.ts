'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface UserRoutingInfo {
  isSystemAdmin: boolean
  isPartnerAdmin: boolean
  hasEnvironments: boolean
  firstEnvironmentSlug?: string
  primaryPartnerSlug?: string
  redirectTo: string
}

export async function getUserRoutingInfo(userId: string): Promise<UserRoutingInfo> {
  const supabase = createClient()
  
  // Use service client to bypass RLS for routing determination
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get user's profile to check if they're a partner admin
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('is_partner_admin, primary_partner_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    // Get user's memberships to determine routing using service client
    const { data: memberships, error: membershipsError } = await serviceClient
      .from('memberships')
      .select(`
        partner_id,
        role,
        partners (
          id,
          slug
        )
      `)
      .eq('user_id', userId)

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError)
      throw new Error('Failed to fetch user memberships')
    }

    // Check if user is a system admin (has membership with null partner_id)
    const systemMembership = memberships?.find(m => m.partner_id === null)
    const isSystemAdmin = !!systemMembership && systemMembership.role === 'admin'
    const isPartnerAdmin = profile?.is_partner_admin || false
    const hasEnvironments = memberships && memberships.length > 0

    // Get the primary partner slug if user is a partner admin
    let primaryPartnerSlug: string | undefined
    if (isPartnerAdmin && profile?.primary_partner_id) {
      const primaryPartner = memberships?.find(m => m.partner_id === profile.primary_partner_id)
      primaryPartnerSlug = (primaryPartner?.partners as any)?.slug
    }

    // Get the first environment slug for redirect (fallback)
    const firstEnvironment = memberships?.find(m => m.partner_id !== null)
    const firstEnvironmentSlug = (firstEnvironment?.partners as any)?.slug

    // Determine redirect destination
    let redirectTo = '/dashboard'
    
    if (isSystemAdmin) {
      redirectTo = '/admin'
    } else if (isPartnerAdmin && primaryPartnerSlug) {
      // Partner admins go to their primary partner
      redirectTo = `/${primaryPartnerSlug}`
    } else if (hasEnvironments && firstEnvironmentSlug) {
      // Regular users go to their first environment
      redirectTo = `/${firstEnvironmentSlug}`
    } else {
      // If user has no environments and is not admin, redirect to dashboard
      redirectTo = '/dashboard'
    }

    return {
      isSystemAdmin,
      isPartnerAdmin,
      hasEnvironments,
      firstEnvironmentSlug,
      primaryPartnerSlug,
      redirectTo
    }
  } catch (error) {
    console.error('Error in getUserRoutingInfo:', error)
    throw error
  }
}

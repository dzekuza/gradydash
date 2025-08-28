import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to bypass RLS for admin status checks
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check for system admin membership (null partner_id)
    const { data: systemMembership, error: systemError } = await serviceClient
      .from('memberships')
      .select('role, partner_id')
      .eq('user_id', user.id)
      .is('partner_id', null)
      .single()

    if (systemError && systemError.code !== 'PGRST116') {
      console.error('Error checking system admin status:', systemError)
    }

    // Check for environment admin membership
    const { data: environmentMembership, error: envError } = await serviceClient
      .from('memberships')
      .select('role, partner_id')
      .eq('user_id', user.id)
      .not('partner_id', 'is', null)
      .eq('role', 'admin')
      .single()

    if (envError && envError.code !== 'PGRST116') {
      console.error('Error checking environment admin status:', envError)
    }

    const isSystemAdmin = !!systemMembership && systemMembership.role === 'admin'
    const isEnvironmentAdmin = !!environmentMembership
    const canCreateEnvironments = isSystemAdmin

    return NextResponse.json({
      isSystemAdmin,
      isEnvironmentAdmin,
      canCreateEnvironments
    })
  } catch (error) {
    console.error('Error in admin user status API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

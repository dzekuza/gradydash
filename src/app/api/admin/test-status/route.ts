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

    const isSystemAdmin = !!systemMembership && systemMembership.role === 'admin'

    return NextResponse.json({
      userId: user.id,
      userEmail: user.email,
      systemMembership,
      systemError: systemError ? systemError.message : null,
      isSystemAdmin
    })
  } catch (error) {
    console.error('Error in test admin status API:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

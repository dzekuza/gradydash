import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userId } = await request.json()
    
    if (!inviteCode || !userId) {
      return NextResponse.json(
        { error: 'Invite code and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookies().getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookies().set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Verify the invite code
    const { data: inviteCodeData, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('is_active', true)
      .single()

    if (inviteError || !inviteCodeData) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (inviteCodeData.expires_at && new Date() > new Date(inviteCodeData.expires_at)) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 400 }
      )
    }

    // Check if code usage limit exceeded
    if (inviteCodeData.used_count >= inviteCodeData.max_uses) {
      return NextResponse.json(
        { error: 'Invite code usage limit exceeded' },
        { status: 400 }
      )
    }

    // Check if user is already a member of this partner
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('*')
      .eq('partner_id', inviteCodeData.partner_id)
      .eq('user_id', userId)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this partner' },
        { status: 400 }
      )
    }

    // Create membership for the user
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        partner_id: inviteCodeData.partner_id,
        user_id: userId,
        role: 'store_manager'
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      return NextResponse.json(
        { error: 'Failed to join partner' },
        { status: 500 }
      )
    }

    // Increment the used count for the invite code
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({ 
        used_count: inviteCodeData.used_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteCodeData.id)

    if (updateError) {
      console.error('Error updating invite code usage:', updateError)
      // Don't fail the request if this fails, just log it
    }

    // Get partner info for response
    const { data: partnerData } = await supabase
      .from('partners')
      .select('id, name, slug')
      .eq('id', inviteCodeData.partner_id)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Successfully joined partner',
      partner: partnerData
    })

  } catch (error) {
    console.error('Partner registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

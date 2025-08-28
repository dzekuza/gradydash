import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, getPlanByPartnerCount } from '@/lib/stripe'
import { getUser } from '@/lib/supabase/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerCount } = await request.json()

    if (!partnerCount || typeof partnerCount !== 'number') {
      return NextResponse.json({ error: 'Invalid partner count' }, { status: 400 })
    }

    // Get the appropriate plan
    const plan = getPlanByPartnerCount(partnerCount)

    // If it's free or enterprise, handle differently
    if (plan.name === 'Free') {
      return NextResponse.json({ 
        error: 'Free plan selected - no payment required',
        plan: plan.name 
      }, { status: 400 })
    }

    if (plan.name === 'Enterprise') {
      return NextResponse.json({ 
        error: 'Enterprise plan - please contact support',
        plan: plan.name 
      }, { status: 400 })
    }

    if (!plan.stripePriceId) {
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 })
    }

    // Create checkout session
    const session = await createCheckoutSession(
      plan.stripePriceId,
      user.email!,
      `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      plan: plan.name 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

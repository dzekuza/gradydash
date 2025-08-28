import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  // Import stripe dynamically
  const { stripe } = await import('@/lib/stripe')
  
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Checkout session completed:', session.id)
        // Here you would typically:
        // 1. Update user's subscription status in your database
        // 2. Send confirmation email
        // 3. Update user's plan limits
        break

      case 'customer.subscription.created':
        const subscription = event.data.object
        console.log('Subscription created:', subscription.id)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object
        console.log('Subscription updated:', updatedSubscription.id)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        console.log('Subscription deleted:', deletedSubscription.id)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object
        console.log('Payment succeeded:', invoice.id)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object
        console.log('Payment failed:', failedInvoice.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

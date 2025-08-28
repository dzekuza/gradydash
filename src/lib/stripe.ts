import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

// Pricing configuration
export const PRICING_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxPartners: 3,
    stripePriceId: null,
  },
  MIDI: {
    name: 'Midi',
    price: 9.99,
    maxPartners: 5,
    stripePriceId: process.env.STRIPE_MIDI_PRICE_ID,
  },
  MAXI: {
    name: 'Maxi',
    price: 19.99,
    maxPartners: 10,
    stripePriceId: process.env.STRIPE_MAXI_PRICE_ID,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null,
    maxPartners: null,
    stripePriceId: null,
  },
}

// Helper function to get plan by partner count
export function getPlanByPartnerCount(partnerCount: number) {
  if (partnerCount <= 3) return PRICING_PLANS.FREE
  if (partnerCount <= 5) return PRICING_PLANS.MIDI
  if (partnerCount <= 10) return PRICING_PLANS.MAXI
  return PRICING_PLANS.ENTERPRISE
}

// Helper function to create checkout session
export async function createCheckoutSession(
  priceId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        customerEmail,
      },
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Helper function to create customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw error
  }
}

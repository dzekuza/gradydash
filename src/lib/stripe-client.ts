import { loadStripe } from '@stripe/stripe-js'

// Client-side Stripe instance
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Pricing configuration for client-side
export const CLIENT_PRICING_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    maxPartners: 3,
  },
  MIDI: {
    name: 'Midi',
    price: 9.99,
    maxPartners: 5,
  },
  MAXI: {
    name: 'Maxi',
    price: 19.99,
    maxPartners: 10,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null,
    maxPartners: null,
  },
}

// Helper function to get plan by partner count (client-side)
export function getClientPlanByPartnerCount(partnerCount: number) {
  if (partnerCount <= 3) return CLIENT_PRICING_PLANS.FREE
  if (partnerCount <= 5) return CLIENT_PRICING_PLANS.MIDI
  if (partnerCount <= 10) return CLIENT_PRICING_PLANS.MAXI
  return CLIENT_PRICING_PLANS.ENTERPRISE
}

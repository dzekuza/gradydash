"use client"

import { useState } from 'react'

const BREAKPOINT_PARTNER_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const BREAKPOINT_PRICES = [0, 29, 49, 69, 89, 109, 129, 149, 169, null]
const BREAKPOINT_PLANS = ['Free', 'Starter', 'Growth', 'Professional', 'Business', 'Enterprise', 'Enterprise+', 'Enterprise++', 'Enterprise+++', 'Custom']

export function LoopsPricingSlider() {
  const [sliderIndex, setSliderIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const partners = BREAKPOINT_PARTNER_VALUES[sliderIndex]
  const price = BREAKPOINT_PRICES[sliderIndex]
  const plan = BREAKPOINT_PLANS[sliderIndex]

  const label = `${partners} partner${partners !== 1 ? 's' : ''}`

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIndex(parseInt(event.target.value))
  }

  const handleUpgrade = async () => {
    if (price === null) {
      window.location.href = 'mailto:support@gradydash.com?subject=Enterprise%20pricing'
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: getPriceId(partners),
          successUrl: `${window.location.origin}/upgrade/success`,
          cancelUrl: `${window.location.origin}/upgrade`,
        }),
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to create checkout session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-3xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Card */}
        <div className="flex-1 rounded-xl border border-border bg-card p-8 relative">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Calculate your pricing</h2>
          <div className="text-3xl font-bold text-card-foreground mb-8">{label}</div>
          <input
            type="range"
            min={0}
            max={BREAKPOINT_PARTNER_VALUES.length - 1}
            step={1}
            value={sliderIndex}
            onChange={handleSliderChange}
            className="w-full appearance-none h-3 rounded bg-muted mb-12"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                (sliderIndex / (BREAKPOINT_PARTNER_VALUES.length - 1)) * 100
              }%, hsl(var(--muted)) ${(sliderIndex / (BREAKPOINT_PARTNER_VALUES.length - 1)) * 100}%, hsl(var(--muted)) 100%)`,
            }}
          />

          <style>{`
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              background: hsl(var(--background));
              border: 2px solid hsl(var(--border));
              border-radius: 50%;
              cursor: pointer;
              margin-top: -1px;
              box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
              position: relative;
            }
            input[type='range']::-moz-range-thumb {
              width: 26px;
              height: 26px;
              background: hsl(var(--background));
              border: 2px solid hsl(var(--border));
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
            }
          `}</style>

          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-muted-foreground">
            <span>Need a custom solution?</span>
            <a
              href="mailto:support@gradydash.com?subject=Enterprise%20pricing"
              className="text-foreground font-medium flex items-center"
            >
              Contact us <span className="ml-1">→</span>
            </a>
          </div>
        </div>

        {/* Right Card */}
        <div className="flex-1 rounded-xl border border-border bg-muted p-8">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Your plan</h2>
          <div className="mb-2">
            <h3 className="text-3xl font-bold text-card-foreground mb-6">
              {price === 0 ? "Free" : price === null ? "Contact us" : `€${price} / mo`}
            </h3>
            <div className="text-sm font-medium text-muted-foreground mb-6">{plan} Plan</div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-8">
            {price === 0
              ? "Our free plan allows up to 3 partners, perfect for small businesses getting started. All core features are included."
              : price === null
              ? "Need custom support for more than 10 partners? Contact us for enterprise pricing."
              : `Enjoy unlimited access to all features for ${partners} partner${partners !== 1 ? 's' : ''}. Perfect for growing businesses.`}
          </p>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-8 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {isLoading ? "Loading..." : price === null ? "Contact us" : "Upgrade now"}
          </button>
        </div>
      </div>
    </section>
  )
}

function getPriceId(partners: number): string {
  // This would map to your actual Stripe price IDs
  const priceMap: Record<number, string> = {
    1: 'price_free',
    2: 'price_starter',
    3: 'price_growth',
    4: 'price_professional',
    5: 'price_business',
    6: 'price_enterprise',
    7: 'price_enterprise_plus',
    8: 'price_enterprise_plus_plus',
    9: 'price_enterprise_plus_plus_plus',
  }
  return priceMap[partners] || 'price_custom'
}

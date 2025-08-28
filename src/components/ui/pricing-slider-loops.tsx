"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { getClientPlanByPartnerCount } from "@/lib/stripe-client"

const PRICING_BREAKPOINTS = [
  { maxPartners: 3, price: 0, plan: "Free" },
  { maxPartners: 5, price: 9.99, plan: "Midi" },
  { maxPartners: 10, price: 19.99, plan: "Maxi" },
]

const BREAKPOINT_PARTNER_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]

const getPriceForPartners = (partners: number): { price: number | null; plan: string; label: string } => {
  const plan = getClientPlanByPartnerCount(partners)
  return { 
    price: plan.price, 
    plan: plan.name, 
    label: `${partners} partner${partners !== 1 ? 's' : ''}` 
  }
}

export const LoopsPricingSlider: React.FC = () => {
  const [sliderIndex, setSliderIndex] = useState(2) // Start at 3 partners (free tier)
  const [isLoading, setIsLoading] = useState(false)

  const partners = BREAKPOINT_PARTNER_VALUES[sliderIndex]
  const { price, plan, label } = getPriceForPartners(partners)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIndex(Number(e.target.value))
  }

  const handleUpgrade = async () => {
    if (plan === 'Free') {
      alert('You are already on the free plan!')
      return
    }

    if (plan === 'Enterprise') {
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
          partnerCount: partners,
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
        <div className="flex-1 rounded-xl border border-gray-200 p-8 relative">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Calculate your pricing</h2>
          <div className="text-3xl font-bold text-black mb-8">{label}</div>
          <input
            type="range"
            min={0}
            max={BREAKPOINT_PARTNER_VALUES.length - 1}
            step={1}
            value={sliderIndex}
            onChange={handleSliderChange}
            className="w-full appearance-none h-3 rounded bg-gray-200 mb-12"
            style={{
              background: `linear-gradient(to right, #F97316 0%, #F97316 ${
                (sliderIndex / (BREAKPOINT_PARTNER_VALUES.length - 1)) * 100
              }%, #E5E7EB ${(sliderIndex / (BREAKPOINT_PARTNER_VALUES.length - 1)) * 100}%, #E5E7EB 100%)`,
            }}
          />

          <style>{`
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              background: #ffffff;
              border: 2px solid #E5E7EB;
              border-radius: 50%;
              cursor: pointer;
              margin-top: -1px;
              box-shadow: 0 1px 5px rgba(192, 192, 192, 0.5);
              position: relative;
            }
            input[type='range']::-moz-range-thumb {
              width: 26px;
              height: 26px;
              background: #ffffff;
              border: 2px solid #E5E7EB;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0 1px 5px rgba(192, 192, 192, 0.5);
            }
          `}</style>

          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-sm text-neutral-500">
            <span>Need a custom solution?</span>
            <a
              href="mailto:support@gradydash.com?subject=Enterprise%20pricing"
              className="text-black font-medium flex items-center"
            >
              Contact us <span className="ml-1">→</span>
            </a>
          </div>
        </div>

        {/* Right Card */}
        <div className="flex-1 rounded-xl border border-gray-200 p-8 bg-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Your plan</h2>
          <div className="mb-2">
            <h3 className="text-3xl font-bold text-black mb-6">
              {price === 0 ? "Free" : price === null ? "Contact us" : `€${price} / mo`}
            </h3>
            <div className="text-sm font-medium text-gray-600 mb-6">{plan} Plan</div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed mt-8">
            {price === 0
              ? "Our free plan allows up to 3 partners, perfect for small businesses getting started. All core features are included."
              : price === null
              ? "Need custom support for more than 10 partners? Contact us for enterprise pricing."
              : `Enjoy unlimited access to all features for ${partners} partner${partners !== 1 ? 's' : ''}. Perfect for growing businesses.`}
          </p>
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-8 inline-block bg-black text-white px-6 py-3 rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : price === null ? "Contact us" : "Upgrade now"}
          </button>
        </div>
      </div>
    </section>
  )
}

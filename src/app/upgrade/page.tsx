import { LoopsPricingSlider } from "@/components/ui/pricing-slider-loops"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UpgradePage() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center relative">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 items-center justify-center text-center mb-8">
        <p className="font-bold text-base text-muted-foreground tracking-[0.4px]">Pricing</p>
        <h1 className="text-4xl font-bold">Choose your plan</h1>
        <p className="tracking-[0.4px] leading-[1.4em] text-center max-w-md mt-2 text-muted-foreground">
          Scale your business with our flexible partner-based pricing. 
          Start free and upgrade as you grow.
        </p>
      </div>

      <LoopsPricingSlider />
    </main>
  )
}

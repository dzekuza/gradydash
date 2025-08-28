import { CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UpgradeSuccessPage() {
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

      <div className="flex flex-col items-center justify-center text-center max-w-md">
        <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for upgrading your plan. Your new features are now available.
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation email shortly with your receipt and next steps.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at support@gradydash.com
          </p>
        </div>
      </div>
    </main>
  )
}

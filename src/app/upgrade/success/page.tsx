import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
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

      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for upgrading your plan. Your subscription has been activated and you now have access to additional features.
          </p>
        </div>

        {searchParams.session_id && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              <strong>Session ID:</strong> {searchParams.session_id}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <p className="text-sm text-gray-500">
            You will receive a confirmation email shortly with your receipt and subscription details.
          </p>
        </div>
      </div>
    </main>
  )
}

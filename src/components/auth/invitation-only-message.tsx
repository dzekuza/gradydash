import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Shield } from 'lucide-react'
import Link from 'next/link'

export function InvitationOnlyMessage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Invitation Required</CardTitle>
        <CardDescription className="text-base">
          Registration is invitation-only for security reasons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">
            To access Grady ReSellOps, you must be invited by an administrator or environment manager.
          </p>
          <p>
            If you believe you should have access, please contact your administrator to receive an invitation.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="w-full" variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Contact Administrator
          </Button>
          <Link href="/login">
            <Button className="w-full" variant="ghost">
              Back to Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

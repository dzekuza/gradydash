import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Mail, Store } from 'lucide-react'
import { LogoutFormButton } from '@/components/auth/logout-form-button'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { getUser } from '@/lib/supabase/auth'

interface NoEnvironmentsProps {
  userEmail?: string
}

export async function NoEnvironments({ userEmail }: NoEnvironmentsProps) {
  const user = await getUser()
  const routingInfo = user ? await getUserRoutingInfo(user.id) : null

  // If user is a partner admin, they should have their primary partner
  if (routingInfo?.isPartnerAdmin && routingInfo.primaryPartnerSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Redirecting to Your Store</CardTitle>
            <CardDescription className="text-base">
              Taking you to your store dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {userEmail && (
                <p className="mb-2">
                  Logged in as: <span className="font-medium">{userEmail}</span>
                </p>
              )}
              <p>
                You should be redirected to your store dashboard shortly.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = `/${routingInfo.primaryPartnerSlug}`}
              >
                <Store className="mr-2 h-4 w-4" />
                Go to My Store
              </Button>
              <LogoutFormButton />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Regular users with no access
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl">No Access Granted</CardTitle>
          <CardDescription className="text-base">
            You haven&apos;t been assigned to any partners yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {userEmail && (
              <p className="mb-2">
                Logged in as: <span className="font-medium">{userEmail}</span>
              </p>
            )}
            <p>
              Please contact your administrator to be granted access to a partner.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="w-full" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact Administrator
            </Button>
            <LogoutFormButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

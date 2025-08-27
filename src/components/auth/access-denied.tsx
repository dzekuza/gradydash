import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'
import { LogoutFormButton } from '@/components/auth/logout-form-button'

interface AccessDeniedProps {
  title?: string
  message?: string
  showHomeButton?: boolean
  showLogoutButton?: boolean
  homeUrl?: string
}

export function AccessDenied({
  title = 'Access Denied',
  message = 'You do not have permission to access this page.',
  showHomeButton = true,
  showLogoutButton = true,
  homeUrl = '/dashboard'
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </div>
          <div className="flex flex-col gap-2">
            {showHomeButton && (
              <Link href={homeUrl}>
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
            {showLogoutButton && (
              <LogoutFormButton />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

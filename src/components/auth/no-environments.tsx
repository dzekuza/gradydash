import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Mail } from 'lucide-react'
import { LogoutFormButton } from '@/components/auth/logout-form-button'

interface NoEnvironmentsProps {
  userEmail?: string
}

export function NoEnvironments({ userEmail }: NoEnvironmentsProps) {
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

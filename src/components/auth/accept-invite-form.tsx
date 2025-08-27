'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { acceptInvite } from '@/lib/db/environments/accept-invite'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client-browser'
import { CheckCircle, LogIn, UserPlus } from 'lucide-react'

interface AcceptInviteFormProps {
  inviteId: string
}

export function AcceptInviteForm({ inviteId }: AcceptInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [environmentSlug, setEnvironmentSlug] = useState('')
  const [environmentName, setEnvironmentName] = useState('')
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleAcceptInvite = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const data = new FormData()
      data.append('inviteId', inviteId)

      const result = await acceptInvite(data)

      if (result.success) {
        setIsAccepted(true)
        setEnvironmentSlug(result.environmentSlug)
        setEnvironmentName(result.environmentName)
        
        toast({
          title: 'Welcome!',
          description: `You've successfully joined ${result.environmentName}`,
        })

        // Redirect to the environment after a short delay
        setTimeout(() => {
          router.push(`/${result.environmentSlug}`)
        }, 2000)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept invitation',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // After successful login, accept the invitation
      await handleAcceptInvite(formData)
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const fullName = formData.get('fullName') as string

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account, then log in.',
      })

      // After successful registration, accept the invitation
      await handleAcceptInvite(formData)
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isAccepted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Invitation Accepted!
          </CardTitle>
          <CardDescription>
            You&apos;ve successfully joined {environmentName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            Redirecting you to the environment...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </TabsTrigger>
        <TabsTrigger value="register" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Create Account
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-4">
        <form action={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login & Accept Invitation'}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="register" className="space-y-4">
        <form action={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-fullName">Full Name</Label>
            <Input
              id="register-fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account & Accept Invitation'}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}

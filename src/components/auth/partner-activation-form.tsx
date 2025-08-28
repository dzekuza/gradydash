'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Key } from 'lucide-react'

const activationSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
})

type ActivationFormData = z.infer<typeof activationSchema>

interface PartnerActivationFormProps {
  userId: string
  className?: string
}

export function PartnerActivationForm({ userId, className }: PartnerActivationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivationFormData>({
    resolver: zodResolver(activationSchema),
  })

  // Handle invite code from URL parameters
  useEffect(() => {
    const inviteCode = searchParams.get('invite')
    if (inviteCode) {
      setValue('inviteCode', inviteCode)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: ActivationFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/partner-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: data.inviteCode,
          userId: userId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to activate partner account')
        return
      }

      setSuccess('Successfully joined partner! Redirecting to dashboard...')
      
      // Redirect to the partner dashboard
      setTimeout(() => {
        if (result.partner?.slug) {
          router.push(`/${result.partner.slug}`)
        } else {
          router.push('/dashboard')
        }
      }, 2000)

    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="text-center space-y-2 pb-4">
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Enter Invite Code
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Use the invite code provided by your admin to join their partner dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-1.5">
                <Label htmlFor="inviteCode" className="text-card-foreground text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Invite Code
                  {searchParams.get('invite') && (
                    <Badge variant="secondary" className="text-xs">Pre-filled from link</Badge>
                  )}
                </Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter your invite code"
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground h-9 focus:ring-ring"
                  {...register('inviteCode')}
                  disabled={isLoading}
                />
                {errors.inviteCode && (
                  <p className="text-xs text-destructive">{errors.inviteCode.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 focus:ring-ring" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Activate Partner Account
              </Button>
            </div>
            
            <div className="mt-4 text-center text-xs text-muted-foreground">
              Don&apos;t have an invite code?{' '}
              <a href="/login" className="text-foreground hover:text-primary transition-colors">
                Contact your admin
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

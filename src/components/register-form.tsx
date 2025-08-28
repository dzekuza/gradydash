'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Crown, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const registerSchema = z.object({
  accountType: z.enum(['admin', 'partner'], {
    required_error: 'Please select an account type',
  }),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name is required').optional(),
  inviteCode: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === 'admin') {
    return data.companyName && data.companyName.length >= 2
  }
  return true
}, {
  message: 'Company name is required for admin accounts',
  path: ['companyName'],
}).refine((data) => {
  if (data.accountType === 'partner') {
    return data.inviteCode && data.inviteCode.length > 0
  }
  return true
}, {
  message: 'Invite code is required for partner accounts',
  path: ['inviteCode'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: undefined,
    },
  })

  const accountType = watch('accountType')

  // Handle invite code from URL parameters
  useEffect(() => {
    const inviteCode = searchParams.get('invite')
    if (inviteCode) {
      setValue('accountType', 'partner')
      setValue('inviteCode', inviteCode)
      setCurrentStep(2) // Skip to step 2 if invite code is provided
    }
  }, [searchParams, setValue])

  const handleNextStep = async () => {
    const isValid = await trigger('accountType')
    if (isValid) {
      setCurrentStep(2)
      setError(null)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
    setError(null)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (data.accountType === 'admin') {
        // Admin registration - create their own partner
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: `${data.firstName} ${data.lastName}`,
              account_type: 'admin',
              company_name: data.companyName,
              first_name: data.firstName,
              last_name: data.lastName,
              phone: data.phone,
            },
          },
        })

        if (error) {
          setError(error.message)
          return
        }

        if (authData.user) {
          setSuccess('Business account created successfully! Setting up your dashboard...')
          
          // Wait for the database triggers to complete and then redirect to dashboard
          // The dashboard page will handle the proper routing
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } else {
        // Partner registration - join existing partner with invite code
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: `${data.firstName} ${data.lastName}`,
              account_type: 'partner',
              invite_code: data.inviteCode,
              first_name: data.firstName,
              last_name: data.lastName,
              phone: data.phone,
            },
          },
        })

        if (error) {
          setError(error.message)
          return
        }

        if (authData.user) {
          setSuccess('Team account created successfully! Please check your email to verify your account, then sign in to activate your team access.')
          
          // For partner accounts, they need to verify email first
          // Then they can use their invite code to join a partner
          setTimeout(() => {
            router.push('/login?message=Please check your email to verify your account, then sign in to activate your team access')
          }, 3000)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          currentStep >= 1 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className={cn(
          "w-12 h-0.5",
          currentStep >= 2 ? "bg-primary" : "bg-muted"
        )} />
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          currentStep >= 2 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">How do you want to use Grady ReSellOps?</h2>
        <p className="text-muted-foreground">
          This helps customize your experience
        </p>
      </div>
      
      <RadioGroup
        value={accountType}
        onValueChange={(value) => setValue('accountType', value as 'admin' | 'partner')}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <RadioGroupItem value="admin" id="admin" className="sr-only" />
          <Label 
            htmlFor="admin" 
            className={cn(
              "flex items-start space-x-4 p-6 border rounded-lg cursor-pointer transition-all duration-200",
              accountType === 'admin' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg mb-2">For businesses</div>
              <div className="text-muted-foreground text-sm leading-relaxed">
                Create and manage your own business dashboard, track products across multiple locations, invite team members and partners, and many more..
              </div>
            </div>
            {accountType === 'admin' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              </div>
            )}
          </Label>
        </div>
        
        <div className="relative">
          <RadioGroupItem value="partner" id="partner" className="sr-only" />
          <Label 
            htmlFor="partner" 
            className={cn(
              "flex items-start space-x-4 p-6 border rounded-lg cursor-pointer transition-all duration-200",
              accountType === 'partner' 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg mb-2">For team members</div>
              <div className="text-muted-foreground text-sm leading-relaxed">
                Join an existing business dashboard, track products assigned to you, access team-specific features and many more..
              </div>
            </div>
            {accountType === 'partner' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              </div>
            )}
          </Label>
        </div>
      </RadioGroup>
      
      {errors.accountType && (
        <Alert variant="destructive">
          <AlertDescription>{errors.accountType.message}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="button" 
        onClick={handleNextStep}
        className="w-full h-12 text-base font-medium"
        disabled={!accountType}
      >
        Continue
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  )

  const renderStep2 = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">
          {accountType === 'admin' ? 'Create Business Account' : 'Join Team Account'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {accountType === 'admin' 
            ? 'Set up your business account and create your first dashboard'
            : 'Enter your details to join the team dashboard'
          }
        </p>
      </div>
      
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="firstName" className="text-sm">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            {...register('firstName')}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        
        <div className="grid gap-1.5">
          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            {...register('lastName')}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid gap-1.5">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register('email')}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      {accountType === 'admin' && (
        <div className="grid gap-1.5">
          <Label htmlFor="companyName" className="text-sm">Company Name *</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="My Awesome Store"
            {...register('companyName')}
            disabled={isLoading}
          />
          {errors.companyName && (
            <p className="text-xs text-destructive">{errors.companyName.message}</p>
          )}
        </div>
      )}
      
      {accountType === 'partner' && (
        <div className="grid gap-1.5">
          <Label htmlFor="inviteCode" className="text-sm">Team Invite Code *</Label>
          <Input
            id="inviteCode"
            type="text"
                          placeholder="Enter your team invite code"
            {...register('inviteCode')}
            disabled={isLoading}
          />
          {errors.inviteCode && (
            <p className="text-xs text-destructive">{errors.inviteCode.message}</p>
          )}
        </div>
      )}
      
      <div className="grid gap-1.5">
        <Label htmlFor="phone" className="text-sm">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register('phone')}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      
      <div className="grid gap-1.5">
        <Label htmlFor="password" className="text-sm">Password</Label>
        <Input 
          id="password" 
          type="password" 
          {...register('password')}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      
      <div className="grid gap-1.5">
        <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePreviousStep}
          className="flex-1"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {accountType === 'admin' ? 'Create Business Account' : 'Create Team Account'}
        </Button>
      </div>
    </form>
  )

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {renderStepIndicator()}
      
      {currentStep === 1 ? renderStep1() : renderStep2()}
      
      {currentStep === 1 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a 
          href="/login" 
          className="text-foreground hover:text-primary transition-colors"
          onClick={(e) => {
            e.preventDefault()
            router.push('/login')
          }}
        >
          Sign in
        </a>
      </div>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PartnerActivationForm } from '@/components/auth/partner-activation-form'

export default async function PartnerActivationPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is already a partner admin or has memberships
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_partner_admin, primary_partner_id')
    .eq('id', user.id)
    .single()

  // If user is already a partner admin, redirect to their dashboard
  if (profile?.is_partner_admin && profile?.primary_partner_id) {
    redirect(`/${profile.primary_partner_id}`)
  }

  // Check if user already has memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('partner_id')
    .eq('user_id', user.id)
    .limit(1)

  if (memberships && memberships.length > 0) {
    redirect(`/${memberships[0].partner_id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Activate Your Partner Account
          </h1>
          <p className="text-muted-foreground">
            Enter your invite code to join your partner dashboard
          </p>
        </div>
        
        <PartnerActivationForm userId={user.id} />
      </div>
    </div>
  )
}

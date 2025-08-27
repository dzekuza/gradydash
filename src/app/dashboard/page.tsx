import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { NoEnvironments } from '@/components/auth/no-environments'

export default async function DashboardRedirectPage() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Get user routing information
  const routingInfo = await getUserRoutingInfo(session.user.id)
  
  // If user is system admin, redirect to admin panel
  if (routingInfo.isSystemAdmin) {
    redirect('/admin')
  }

  // If user has no memberships at all, show no environments message
  if (!routingInfo.hasEnvironments) {
    return <NoEnvironments userEmail={session.user.email} />
  }

  // If user has assigned environments, redirect to the first one
  if (routingInfo.firstEnvironmentSlug) {
    redirect(`/${routingInfo.firstEnvironmentSlug}`)
  }

  // Fallback: show no environments message
  return <NoEnvironments userEmail={session.user.email} />
}

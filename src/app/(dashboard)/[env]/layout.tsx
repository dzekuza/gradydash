import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { EnvironmentSwitcher } from '@/components/dashboard/environment-switcher'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSession } from '@/lib/supabase/auth'
import { getEnvironmentsForUser, getEnvironmentBySlug } from '@/lib/db/environments/get-environments'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: { env: string }
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const session = await getSession()
  
  if (!session?.user) {
    notFound()
  }

  // Get user's environments and current environment
  const [environments, currentEnvironment] = await Promise.all([
    getEnvironmentsForUser(session.user.id),
    getEnvironmentBySlug(params.env),
  ])

  if (!currentEnvironment) {
    notFound()
  }

  // Check if user has access to this environment
  const hasAccess = environments.some(env => env.id === currentEnvironment.id)
  if (!hasAccess) {
    notFound()
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          environmentSwitcher={
            <Suspense fallback={<div className="h-10 bg-muted animate-pulse rounded" />}>
              <EnvironmentSwitcher
                environments={environments}
                currentEnvironment={currentEnvironment}
              />
            </Suspense>
          }
          currentEnvironment={currentEnvironment}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

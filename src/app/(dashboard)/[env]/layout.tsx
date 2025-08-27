import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { EnvironmentSwitcher } from '@/components/dashboard/environment-switcher'
import { PageBreadcrumb } from '@/components/dashboard/page-breadcrumb'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { getSession, getCurrentUserProfile } from '@/lib/supabase/auth'
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

  // Get user's environments, current environment, and profile
  const [environments, currentEnvironment, userProfile] = await Promise.all([
    getEnvironmentsForUser(session.user.id),
    getEnvironmentBySlug(params.env),
    getCurrentUserProfile(),
  ])

  if (!currentEnvironment) {
    notFound()
  }

  // Check if user has access to this environment
  // If the user created this environment, they should have access even if membership isn't created yet
  const hasAccess = environments.some(env => env.id === currentEnvironment.id) || 
                   currentEnvironment.created_by === session.user.id
  if (!hasAccess) {
    notFound()
  }

  return (
    <SidebarProvider>
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
        userProfile={userProfile}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <PageBreadcrumb 
              environmentName={currentEnvironment.name}
              environmentSlug={currentEnvironment.slug}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

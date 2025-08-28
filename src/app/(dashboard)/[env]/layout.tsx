import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileEnvironmentSwitcher } from '@/components/mobile-environment-switcher'
import { MobileUserMenu } from '@/components/mobile-user-menu'
import { EnvironmentSwitcher } from '@/components/dashboard/environment-switcher'
import { PageBreadcrumb } from '@/components/dashboard/page-breadcrumb'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { getUser, getCurrentUserProfile } from '@/lib/supabase/auth'
import { getEnvironmentsForUser, getEnvironmentBySlug } from '@/lib/db/environments/get-environments'

interface EnvironmentLayoutProps {
  children: React.ReactNode
  params: { env: string }
}

export default async function EnvironmentLayout({
  children,
  params,
}: EnvironmentLayoutProps) {
  try {
    const user = await getUser()
    
    if (!user) {
      notFound()
    }

    // Get user's environments and profile first
    const [environments, userProfile] = await Promise.all([
      getEnvironmentsForUser(user.id),
      getCurrentUserProfile(),
    ])

    // Check if user has access to the requested environment
    const hasAccess = environments.some(env => env.slug === params.env)
    if (!hasAccess) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`User ${user.id} does not have access to environment '${params.env}'`)
      }
      notFound()
    }

    // Now get the current environment (user has access, so RLS will allow it)
    const currentEnvironment = await getEnvironmentBySlug(params.env)
    if (!currentEnvironment) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Environment '${params.env}' not found in database`)
      }
      notFound()
    }

    return (
      <>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
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
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center justify-between gap-2 px-4 w-full">
              <PageBreadcrumb 
                environmentName={currentEnvironment.name}
                environmentSlug={currentEnvironment.slug}
              />
              <div className="flex items-center gap-2">
                <MobileEnvironmentSwitcher
                  environments={environments}
                  currentEnvironment={currentEnvironment}
                />
                <MobileUserMenu userProfile={userProfile} />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 pt-0 pb-20">
            {children}
          </div>
          <MobileBottomNav currentEnvironment={currentEnvironment} />
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in environment layout:', error)
    notFound()
  }
}

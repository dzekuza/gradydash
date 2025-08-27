import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { EnvironmentSwitcher } from '@/components/dashboard/environment-switcher'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/${currentEnvironment.slug}`}>
                    {currentEnvironment.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

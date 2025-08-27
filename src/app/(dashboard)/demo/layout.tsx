import { cookies } from 'next/headers'
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
import { getCurrentUserProfile } from '@/lib/supabase/auth'
import { getOrCreateDemoEnvironment } from '@/lib/db/environments/get-demo-environment'
import { getUserEnvironments } from '@/lib/db/environments/get-user-environments'

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  
  // Get real user profile data
  const userProfile = await getCurrentUserProfile(cookieStore)
  
  // Get the real demo environment from database
  const demoEnvironment = await getOrCreateDemoEnvironment(cookieStore)

  // Get all environments the user has access to
  const userEnvironments = await getUserEnvironments(cookieStore)
  
  // Use user environments if available, otherwise fall back to just demo environment
  const environments = userEnvironments.length > 0 ? userEnvironments : [demoEnvironment]

  return (
    <SidebarProvider>
      <AppSidebar
        environmentSwitcher={
          <EnvironmentSwitcher
            environments={environments}
            currentEnvironment={demoEnvironment}
          />
        }
        currentEnvironment={demoEnvironment}
        userProfile={userProfile}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/demo">
                    {demoEnvironment.name}
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

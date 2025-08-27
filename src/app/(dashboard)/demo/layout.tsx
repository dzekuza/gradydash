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

const demoEnvironment = {
  id: 'demo-env',
  name: 'Demo Environment',
  slug: 'demo',
  description: 'Demo environment for testing',
  created_by: 'demo-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const demoEnvironments = [
  demoEnvironment,
  {
    id: 'test-env',
    name: 'Test Environment',
    slug: 'test',
    description: 'Test environment',
    created_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar
        environmentSwitcher={
          <EnvironmentSwitcher
            environments={demoEnvironments}
            currentEnvironment={demoEnvironment}
          />
        }
        currentEnvironment={demoEnvironment}
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

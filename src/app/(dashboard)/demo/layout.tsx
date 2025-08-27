import { AppSidebar } from '@/components/app-sidebar'
import { EnvironmentSwitcher } from '@/components/dashboard/environment-switcher'
import { SidebarProvider } from '@/components/ui/sidebar'

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
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          environmentSwitcher={
            <EnvironmentSwitcher
              environments={demoEnvironments}
              currentEnvironment={demoEnvironment}
            />
          }
          currentEnvironment={demoEnvironment}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

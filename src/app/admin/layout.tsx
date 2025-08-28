import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { AccessDenied } from '@/components/auth/access-denied'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user routing information
  const routingInfo = await getUserRoutingInfo(user.id)
  
  // Check if user can access admin panel
  if (!routingInfo.isSystemAdmin) {
    return (
      <AccessDenied
        title="Admin Access Required"
        message="You need administrator privileges to access this area."
        homeUrl={routingInfo.redirectTo}
      />
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        showAdminBadge={true}
        adminRole="admin"
        userProfile={null}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

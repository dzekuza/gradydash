import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/auth'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { getCurrentProfile } from '@/lib/db/profiles/get-profile'
import { AccessDenied } from '@/components/auth/access-denied'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileUserMenu } from '@/components/mobile-user-menu'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user routing information and profile
  const [routingInfo, userProfile] = await Promise.all([
    getUserRoutingInfo(user.id),
    getCurrentProfile()
  ])
  
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
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarProvider>
          <AppSidebar
            showAdminBadge={true}
            adminRole="admin"
            userProfile={userProfile}
            collapsible="icon"
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="text-sm font-medium">Admin Panel</div>
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
            <div className="text-sm font-medium">Admin Panel</div>
            <MobileUserMenu userProfile={userProfile} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-20">
          {children}
        </div>
        <MobileBottomNav showAdminBadge={true} />
      </div>
    </>
  )
}

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/auth'
import { getUserRoutingInfo } from '@/lib/db/environments/get-user-routing-info'
import { AccessDenied } from '@/components/auth/access-denied'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Get user routing information
  const routingInfo = await getUserRoutingInfo(session.user.id)
  
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
    <div className="flex h-screen bg-background">
      {/* Admin Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <AdminSidebar userRole="admin" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <div className="text-sm font-medium">Admin Panel</div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import {
  BarChart3,
  Building2,
  MapPin,
  Package,
  Settings2,
  Users,
  Shield,
  Settings,
  Plus,
  type LucideIcon,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Image from 'next/image'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Environment, Profile } from "@/types/db"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  environmentSwitcher?: React.ReactNode
  currentEnvironment?: Environment | null
  userProfile?: Profile | null
  showAdminBadge?: boolean
  adminRole?: string | null
}

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function AppSidebar({ 
  environmentSwitcher,
  currentEnvironment,
  userProfile,
  showAdminBadge = false,
  adminRole = null,
  ...props 
}: AppSidebarProps) {
  const pathname = usePathname()
  
  // Generate navigation items based on current environment or admin status
  let navMain: NavItem[] = []
  
  if (showAdminBadge && pathname.startsWith('/admin')) {
    // System Admin navigation
    navMain = [
      {
        title: "System Dashboard",
        url: "/admin",
        icon: Shield,
        isActive: pathname === "/admin",
      },
      {
        title: "Partners",
        url: "/admin/partners",
        icon: Building2,
        isActive: pathname.startsWith("/admin/partners"),
      },
      {
        title: "Locations",
        url: "/admin/locations",
        icon: MapPin,
        isActive: pathname.startsWith("/admin/locations"),
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
        isActive: pathname.startsWith("/admin/users"),
      },
      {
        title: "System Settings",
        url: "/admin/settings",
        icon: Settings,
        isActive: pathname.startsWith("/admin/settings"),
      },
    ]
  } else if (currentEnvironment) {
    // Partner-specific navigation
    navMain = [
      {
        title: "Partner Dashboard",
        url: `/${currentEnvironment.slug}`,
        icon: BarChart3,
        isActive: pathname === `/${currentEnvironment.slug}`,
      },
      {
        title: "Products",
        url: `/${currentEnvironment.slug}/products`,
        icon: Package,
        isActive: pathname.startsWith(`/${currentEnvironment.slug}/products`),
      },
      {
        title: "Locations",
        url: `/${currentEnvironment.slug}/locations`,
        icon: MapPin,
        isActive: pathname.startsWith(`/${currentEnvironment.slug}/locations`),
      },
      {
        title: "Members",
        url: `/${currentEnvironment.slug}/members`,
        icon: Users,
        isActive: pathname.startsWith(`/${currentEnvironment.slug}/members`),
      },
      {
        title: "Analytics",
        url: `/${currentEnvironment.slug}/analytics`,
        icon: BarChart3,
        isActive: pathname.startsWith(`/${currentEnvironment.slug}/analytics`),
      },
      {
        title: "Partner Settings",
        url: `/${currentEnvironment.slug}/settings`,
        icon: Settings2,
        isActive: pathname.startsWith(`/${currentEnvironment.slug}/settings`),
      },
    ]
  }

  // Use real user profile data
  const user = userProfile ? {
    name: userProfile.full_name || userProfile.email,
    email: userProfile.email,
    avatar: userProfile.avatar_url || "/avatars/default.jpg",
    role: showAdminBadge ? adminRole : undefined,
  } : {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {environmentSwitcher}
      </SidebarHeader>
      <SidebarContent>
        {/* Partner Logo Section */}
        {currentEnvironment && !showAdminBadge && (
          <div className="px-4 py-6 border-b">
            <div className="flex items-center gap-3">
              {currentEnvironment.logo_url ? (
                <Image
                  src={currentEnvironment.logo_url}
                  alt={`${currentEnvironment.name} logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover rounded-lg"
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">{currentEnvironment.name}</h2>
                <p className="text-sm text-muted-foreground truncate">
                  Partner Dashboard
                </p>
              </div>
            </div>
          </div>
        )}
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-4 border-t">
          <NavUser user={user} />
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

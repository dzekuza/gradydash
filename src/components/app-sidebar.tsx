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

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
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
        url: "/admin/environments",
        icon: Building2,
        isActive: pathname.startsWith("/admin/environments"),
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import {
  BarChart3,
  Building2,
  MapPin,
  Package,
  Settings2,
  Users,
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
import { Environment } from "@/types/db"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  environmentSwitcher?: React.ReactNode
  currentEnvironment?: Environment
}

export function AppSidebar({ 
  environmentSwitcher,
  currentEnvironment,
  ...props 
}: AppSidebarProps) {
  const pathname = usePathname()
  
  // Generate navigation items based on current environment
  const navMain = currentEnvironment ? [
    {
      title: "Dashboard",
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
      title: "Settings",
      url: `/${currentEnvironment.slug}/settings`,
      icon: Settings2,
      isActive: pathname.startsWith(`/${currentEnvironment.slug}/settings`),
    },
  ] : []

  const user = {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "/avatars/demo.jpg",
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

"use client"

import * as React from "react"
import {
  BarChart3,
  Package,
  MapPin,
  Users,
  Settings2,
} from "lucide-react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Environment } from '@/types/db'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  environmentSwitcher: React.ReactNode
  currentEnvironment: Environment
}

export function AppSidebar({ 
  environmentSwitcher, 
  currentEnvironment, 
  ...props 
}: AppSidebarProps) {
  const pathname = usePathname()
  
  const navItems = [
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
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Grady ReSellOps</h2>
          {environmentSwitcher}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: "User",
          email: "user@example.com",
          avatar: "/avatars/user.jpg",
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

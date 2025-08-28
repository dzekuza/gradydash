"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Building2,
  MapPin,
  Package,
  Settings2,
  Users,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { Environment } from "@/types/db"

interface MobileBottomNavProps {
  currentEnvironment?: Environment | null
  showAdminBadge?: boolean
}

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive: boolean
}

export function MobileBottomNav({ 
  currentEnvironment,
  showAdminBadge = false,
}: MobileBottomNavProps) {
  const pathname = usePathname()
  
  // Generate navigation items based on current environment or admin status
  let navItems: NavItem[] = []
  
  if (showAdminBadge && pathname.startsWith('/admin')) {
    // System Admin navigation
    navItems = [
      {
        title: "Dashboard",
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
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        isActive: pathname.startsWith("/admin/settings"),
      },
    ]
  } else if (currentEnvironment) {
    // Partner-specific navigation - limit to 5 items for mobile
    const allNavItems = [
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
    ]
    
    // Take first 5 items for mobile bottom nav
    navItems = allNavItems.slice(0, 5)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 px-1 rounded-lg transition-colors",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

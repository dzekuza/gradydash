'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Shield } from 'lucide-react'

export function AdminBreadcrumb() {
  const pathname = usePathname()
  
  const getBreadcrumbItems = () => {
    const items = [
      {
        title: 'System Admin',
        href: '/admin',
        isCurrent: pathname === '/admin'
      }
    ]

    if (pathname.startsWith('/admin/environments')) {
      items.push({
        title: 'Partners',
        href: '/admin/environments',
        isCurrent: pathname === '/admin/environments'
      })
    }

    if (pathname.startsWith('/admin/users')) {
      items.push({
        title: 'Users',
        href: '/admin/users',
        isCurrent: pathname === '/admin/users'
      })
    }

    if (pathname.startsWith('/admin/invites')) {
      items.push({
        title: 'Invites',
        href: '/admin/invites',
        isCurrent: pathname === '/admin/invites'
      })
    }

    if (pathname.startsWith('/admin/settings')) {
      items.push({
        title: 'System Settings',
        href: '/admin/settings',
        isCurrent: pathname === '/admin/settings'
      })
    }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          {breadcrumbItems.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              {item.isCurrent ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
              )}
            </div>
          ))}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

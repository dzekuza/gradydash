'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface PageBreadcrumbProps {
  environmentName: string
  environmentSlug: string
}

export function PageBreadcrumb({ environmentName, environmentSlug }: PageBreadcrumbProps) {
  const pathname = usePathname()
  
  // Extract the page name from the pathname
  const getPageName = () => {
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]
    
    // Map route segments to display names
    const pageNames: Record<string, string> = {
      'products': 'Products',
      'locations': 'Locations',
      'members': 'Members',
      'analytics': 'Analytics',
      'settings': 'Environment Settings',
    }
    
    return pageNames[lastSegment] || 'Environment Dashboard'
  }
  
  const pageName = getPageName()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={`/${environmentSlug}`}>
            {environmentName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

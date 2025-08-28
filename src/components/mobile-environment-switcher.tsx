"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Environment } from "@/types/db"

interface MobileEnvironmentSwitcherProps {
  environments: Environment[]
  currentEnvironment: Environment
}

export function MobileEnvironmentSwitcher({
  environments,
  currentEnvironment,
}: MobileEnvironmentSwitcherProps) {
  const pathname = usePathname()

  const getEnvironmentUrl = (env: Environment) => {
    // Extract the current section from the pathname
    const pathParts = pathname.split('/')
    if (pathParts.length >= 2) {
      const currentSection = pathParts[2] // e.g., "products", "locations", etc.
      if (currentSection && currentSection !== currentEnvironment.slug) {
        return `/${env.slug}/${currentSection}`
      }
    }
    return `/${env.slug}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <div className="flex items-center gap-2">
            {currentEnvironment.logo_url ? (
              <Image
                src={currentEnvironment.logo_url}
                alt={`${currentEnvironment.name} logo`}
                width={20}
                height={20}
                className="h-5 w-5 object-cover rounded"
              />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span className="text-sm font-medium truncate max-w-24">
              {currentEnvironment.name}
            </span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {environments.map((environment) => (
          <DropdownMenuItem key={environment.id} asChild>
            <Link
              href={getEnvironmentUrl(environment)}
              className="flex items-center gap-3"
            >
              {environment.logo_url ? (
                <Image
                  src={environment.logo_url}
                  alt={`${environment.name} logo`}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-cover rounded"
                />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{environment.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {environment.slug}
                </div>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

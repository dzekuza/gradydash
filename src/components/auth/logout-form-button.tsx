'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/auth/logout-action'

export function LogoutFormButton() {
  return (
    <form action={logoutAction}>
      <Button 
        type="submit"
        variant="outline" 
        className="w-full"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  )
}

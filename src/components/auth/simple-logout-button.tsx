'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut } from 'lucide-react'

export function SimpleLogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error logging out:', error)
      } else {
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}

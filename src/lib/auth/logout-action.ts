'use server'

import { createClient } from '@/lib/supabase/client-server'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const supabase = createClient()
  
  try {
    await supabase.auth.signOut()
    redirect('/login')
  } catch (error) {
    console.error('Error logging out:', error)
    redirect('/login')
  }
}

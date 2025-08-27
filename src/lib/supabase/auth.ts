import { createClient } from './client-server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/db'

export async function getSession() {
  const supabase = createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  return session.user
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const user = await getUser()
  
  if (!user) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error in getCurrentUserProfile:', error)
    return null
  }
}

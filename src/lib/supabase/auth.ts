import { createClient } from './client-server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/db'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export async function getUser(cookieStore?: ReadonlyRequestCookies) {
  const supabase = createClient(cookieStore)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getSession(cookieStore?: ReadonlyRequestCookies) {
  const supabase = createClient(cookieStore)
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function getCurrentUserProfile(cookieStore?: ReadonlyRequestCookies): Promise<Profile | null> {
  const supabase = createClient(cookieStore)
  const user = await getUser(cookieStore)
  
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

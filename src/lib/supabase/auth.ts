import { createClient } from './client-server'
import { redirect } from 'next/navigation'

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

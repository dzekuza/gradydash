import { createClient } from '@/lib/supabase/client-server'

export async function getUserMembership(userId: string, environmentSlug: string) {
  const supabase = createClient()

  // Get the environment by slug
  const { data: environment, error: envError } = await supabase
    .from('environments')
    .select('id')
    .eq('slug', environmentSlug)
    .single()

  if (envError || !environment) {
    return null
  }

  // Get user's membership in this environment
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('role')
    .eq('environment_id', environment.id)
    .eq('user_id', userId)
    .single()

  if (membershipError) {
    return null
  }

  return membership
}

import { createClient } from '@/lib/supabase/client-server'

export async function getMembers(environmentSlug: string) {
  const supabase = createClient()

  // Get the environment by slug
  const { data: environment, error: envError } = await supabase
    .from('environments')
    .select('id')
    .eq('slug', environmentSlug)
    .single()

  if (envError || !environment) {
    return []
  }

  // Get members for this environment
  const { data: members, error } = await supabase
    .from('memberships')
    .select(`
      id,
      role,
      created_at,
      profiles!inner(
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('environment_id', environment.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
    return []
  }

  // Transform the data to match the expected interface
  const transformedMembers = (members || []).map(member => ({
    ...member,
    profiles: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  }))

  return transformedMembers
}

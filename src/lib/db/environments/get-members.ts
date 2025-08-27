import { createClient } from '@/lib/supabase/client-server'

export async function getEnvironmentMembers(environmentId: string) {
  const supabase = createClient()

  try {
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
      .eq('environment_id', environmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      throw new Error('Failed to fetch members')
    }

    // Transform the data to match the expected interface
    const transformedMembers = (members || []).map(member => ({
      ...member,
      profiles: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
    }))

    return transformedMembers
  } catch (error) {
    console.error('Error in getEnvironmentMembers:', error)
    throw error
  }
}

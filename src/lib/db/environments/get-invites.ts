import { createClient } from '@/lib/supabase/client-server'

export async function getEnvironmentInvites(environmentId: string) {
  const supabase = createClient()

  try {
    const { data: invites, error } = await supabase
      .from('environment_invites')
      .select(`
        id,
        email,
        role,
        invited_by,
        accepted_at,
        expires_at,
        created_at,
        environments!inner(name, slug)
      `)
      .eq('environment_id', environmentId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invites:', error)
      throw new Error('Failed to fetch invitations')
    }

    // Transform the data to match the expected interface
    const transformedInvites = (invites || []).map(invite => ({
      ...invite,
      environments: Array.isArray(invite.environments) ? invite.environments[0] : invite.environments
    }))

    return transformedInvites
  } catch (error) {
    console.error('Error in getEnvironmentInvites:', error)
    throw error
  }
}

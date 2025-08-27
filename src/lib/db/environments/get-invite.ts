import { createClient } from '@/lib/supabase/client-server'

export async function getInvite(inviteId: string) {
  const supabase = createClient()

  try {
    const { data: invite, error } = await supabase
      .from('environment_invites')
      .select(`
        id,
        environment_id,
        email,
        role,
        invited_by,
        accepted_at,
        expires_at,
        created_at,
        environments!inner(name, slug)
      `)
      .eq('id', inviteId)
      .single()

    if (error) {
      console.error('Error fetching invite:', error)
      throw new Error('Failed to fetch invitation')
    }

    // Handle the environments relationship (could be array or single object)
    const transformedInvite = {
      ...invite,
      environments: Array.isArray(invite.environments) ? invite.environments[0] : invite.environments
    }

    return transformedInvite
  } catch (error) {
    console.error('Error in getInvite:', error)
    throw error
  }
}

import { createClient } from '@/lib/supabase/client-server'

export async function getInvite(inviteId: string) {
  const supabase = createClient()

  try {
    const { data: invite, error } = await supabase
      .from('partner_invites')
      .select(`
        id,
        partner_id,
        email,
        role,
        invited_by,
        accepted_at,
        expires_at,
        created_at,
        partners!inner(name, slug)
      `)
      .eq('id', inviteId)
      .single()

    if (error) {
      console.error('Error fetching invite:', error)
      throw new Error('Failed to fetch invitation')
    }

    // Handle the partners relationship (could be array or single object)
    const transformedInvite = {
      ...invite,
      partners: Array.isArray(invite.partners) ? invite.partners[0] : invite.partners
    }

    return transformedInvite
  } catch (error) {
    console.error('Error in getInvite:', error)
    throw error
  }
}

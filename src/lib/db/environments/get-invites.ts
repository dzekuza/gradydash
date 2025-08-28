import { createClient } from '@/lib/supabase/client-server'

export async function getEnvironmentInvites(environmentId: string) {
  const supabase = createClient()

  try {
    const { data: invites, error } = await supabase
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
      .eq('partner_id', environmentId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invites:', error)
      return []
    }

    // Transform the data to match the expected interface
    const transformedInvites = (invites || []).map(invite => ({
      ...invite,
      partners: Array.isArray(invite.partners) ? invite.partners[0] : invite.partners
    }))

    return transformedInvites
  } catch (error) {
    console.error('Error in getEnvironmentInvites:', error)
    return []
  }
}

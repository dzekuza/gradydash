import { createClient } from '@/lib/supabase/client-server'

export interface PendingInvite {
  id: string
  partner_id: string
  email: string
  role: string
  invited_by: string | null
  expires_at: string
  created_at: string
  environment: {
    id: string
    name: string
    slug: string
  } | null
  inviter: {
    id: string
    full_name: string
    email: string
  } | null
}

export async function getPendingInvites(): Promise<PendingInvite[]> {
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
        expires_at,
        created_at,
        partners (
          id,
          name,
          slug
        ),
        profiles!partner_invites_invited_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending invites:', error)
      return []
    }

    // Transform the data to match the PendingInvite interface
    const transformedInvites: PendingInvite[] = (invites || []).map(invite => ({
      id: invite.id,
      partner_id: invite.partner_id,
      email: invite.email,
      role: invite.role,
      invited_by: invite.invited_by,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
      environment: invite.partners?.[0] || null,
      inviter: invite.profiles?.[0] || null
    }))

    return transformedInvites
  } catch (error) {
    console.error('Error in getPendingInvites:', error)
    return []
  }
}

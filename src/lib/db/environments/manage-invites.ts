'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function resendInvite(inviteId: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get the invite details
    const { data: invite, error: inviteError } = await supabase
      .from('environment_invites')
      .select(`
        *,
        environments (
          id,
          name,
          slug
        )
      `)
      .eq('id', inviteId)
      .single()

    if (inviteError || !invite) {
      throw new Error('Invite not found')
    }

    // Check if invite is still valid
    if (invite.accepted_at) {
      throw new Error('Invite has already been accepted')
    }

    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('Invite has expired')
    }

    // TODO: Send email using the email service
    // For now, we'll just update the created_at timestamp to "refresh" the invite
    const { error: updateError } = await supabase
      .from('environment_invites')
      .update({
        created_at: new Date().toISOString()
      })
      .eq('id', inviteId)

    if (updateError) {
      throw new Error('Failed to update invite')
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error resending invite:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to resend invite')
  }
}

export async function cancelInvite(inviteId: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check if invite exists and is not accepted
    const { data: invite, error: inviteError } = await supabase
      .from('environment_invites')
      .select('id, accepted_at')
      .eq('id', inviteId)
      .single()

    if (inviteError || !invite) {
      throw new Error('Invite not found')
    }

    if (invite.accepted_at) {
      throw new Error('Cannot cancel an accepted invite')
    }

    // Delete the invite
    const { error: deleteError } = await supabase
      .from('environment_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteError) {
      throw new Error('Failed to cancel invite')
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling invite:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel invite')
  }
}

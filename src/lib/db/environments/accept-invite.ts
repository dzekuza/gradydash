'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { acceptInviteSchema } from '@/lib/utils/zod-schemas/invite'

export async function acceptInvite(formData: FormData) {
  const supabase = createClient()
  
  const inviteId = formData.get('inviteId') as string

  // Validate input
  const validation = acceptInviteSchema.safeParse({ invite_id: inviteId })
  if (!validation.success) {
    throw new Error('Invalid invitation ID')
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get the invitation
    const { data: invite, error: inviteError } = await supabase
      .from('environment_invites')
      .select(`
        id,
        environment_id,
        email,
        role,
        expires_at,
        accepted_at,
        environments!inner(name, slug)
      `)
      .eq('id', inviteId)
      .single()

    if (inviteError || !invite) {
      throw new Error('Invitation not found')
    }

    // Handle the environments relationship (could be array or single object)
    const environment = Array.isArray(invite.environments) ? invite.environments[0] : invite.environments

    // Check if invitation is expired
    if (new Date(invite.expires_at) < new Date()) {
      throw new Error('This invitation has expired')
    }

    // Check if invitation is already accepted
    if (invite.accepted_at) {
      throw new Error('This invitation has already been accepted')
    }

    // Check if the user's email matches the invitation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (!profile || profile.email !== invite.email) {
      throw new Error('This invitation was sent to a different email address')
    }

    // Check if user is already a member of this environment
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('environment_id', invite.environment_id)
      .eq('user_id', user.id)
      .single()

    if (existingMembership) {
      throw new Error('You are already a member of this environment')
    }

    // Start a transaction
    const { error: acceptError } = await supabase
      .from('environment_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', inviteId)

    if (acceptError) {
      console.error('Error accepting invitation:', acceptError)
      throw new Error('Failed to accept invitation')
    }

    // Create the membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        environment_id: invite.environment_id,
        user_id: user.id,
        role: invite.role
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      throw new Error('Failed to create membership')
    }

    revalidatePath('/')
    return { 
      success: true, 
      environmentSlug: environment.slug,
      environmentName: environment.name
    }
  } catch (error) {
    console.error('Error in acceptInvite:', error)
    throw error
  }
}

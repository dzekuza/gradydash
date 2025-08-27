'use server'

import { createClient } from '@/lib/supabase/client-server'
import { inviteSchema } from '@/lib/utils/zod-schemas/invite'
import { getUserAdminStatus } from './get-user-admin-status'
import { EmailService } from '@/lib/email/email-service'
import crypto from 'crypto'

export async function inviteMember(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const environmentId = formData.get('environmentId') as string
  const inviteType = formData.get('inviteType') as string // 'environment' or 'system_admin'
  const targetEnvironmentId = formData.get('targetEnvironmentId') as string // for admin inviting to specific environment

  // Validate input - handle null environment_id for system admin invites
  const environmentIdToValidate = inviteType === 'environment' ? environmentId : targetEnvironmentId
  const validation = inviteSchema.safeParse({ 
    email, 
    role, 
    environmentId: environmentIdToValidate || ''
  })
  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.errors.map(e => e.message).join(', '))
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Check user's admin status
    const { isSystemAdmin } = await getUserAdminStatus(user.id)

    // Determine the target environment and role based on invite type
    let finalEnvironmentId: string | null = null
    let finalRole = role

    if (inviteType === 'system_admin') {
      // System admin invitation - no environment_id
      if (!isSystemAdmin) {
        throw new Error('Only system admins can invite other system admins')
      }
      if (role !== 'admin') {
        throw new Error('System admin invitations can only be for admin role')
      }
      finalEnvironmentId = null
    } else {
      // Environment-specific invitation
      if (isSystemAdmin) {
        // Admin inviting to specific environment
        finalEnvironmentId = targetEnvironmentId || environmentId
        finalRole = role
      } else {
        // Regular user inviting to their environment
        finalEnvironmentId = environmentId
        finalRole = 'store_manager' // Force store_manager role for environment invitations
      }

      // Check if user has permission to invite to this environment
      if (!isSystemAdmin) {
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('role')
          .eq('environment_id', finalEnvironmentId)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membership) {
          throw new Error('You do not have permission to invite members to this environment')
        }

        // Only allow store_manager and admin to invite members
if (!['store_manager', 'admin'].includes(membership.role)) {
          throw new Error('You do not have permission to invite members')
        }
      }
    }

    // Check if the invited user is already a member
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      if (inviteType === 'system_admin') {
        // Check if user is already a system admin
        const { data: existingSystemMembership } = await supabase
          .from('memberships')
          .select('id')
          .eq('user_id', existingUser.id)
          .is('environment_id', null)
          .single()

        if (existingSystemMembership) {
          throw new Error('This user is already a system admin')
        }
      } else {
        // Check if user is already a member of the target environment
        const { data: existingMembership } = await supabase
          .from('memberships')
          .select('id')
          .eq('environment_id', finalEnvironmentId)
          .eq('user_id', existingUser.id)
          .single()

        if (existingMembership) {
          throw new Error('This user is already a member of this environment')
        }
      }
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from('environment_invites')
      .select('id')
      .eq('email', email)
      .is('accepted_at', null)
      .single()

    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email address')
    }

    // Create the invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generate a unique token for the invitation
    const token = crypto.randomBytes(32).toString('hex')

    const { data: invite, error: inviteError } = await supabase
      .from('environment_invites')
      .insert({
        environment_id: finalEnvironmentId,
        email,
        role: finalRole,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        token: token
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      throw new Error('Failed to create invitation: ' + inviteError.message)
    }

    // Send email notification
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invite.id}`
    
    try {
      // Get user profile for display name
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Get environment name for email
      let environmentName = 'System'
      if (finalEnvironmentId) {
        const { data: environmentData } = await supabase
          .from('environments')
          .select('name')
          .eq('id', finalEnvironmentId)
          .single()
        environmentName = environmentData?.name || 'Unknown Environment'
      }

      await EmailService.sendInviteEmail({
        to: email,
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
        inviterName: userProfile?.full_name || user.email,
        environmentName,
        inviteUrl,
        role: finalRole
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the entire operation if email fails
      // The invitation is still created and can be accessed via the URL
    }

    return { success: true, inviteId: invite.id, inviteUrl }
  } catch (error) {
    console.error('Error in inviteMember:', error)
    throw error
  }
}

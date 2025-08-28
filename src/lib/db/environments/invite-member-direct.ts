'use server'

import { createClient } from '@/lib/supabase/client-server'
import { EmailService } from '@/lib/email/email-service'
import crypto from 'crypto'

export async function inviteMemberDirect(
  partnerId: string,
  email: string,
  role: 'admin' | 'store_manager',
  invitedByUserId: string
) {
  const supabase = createClient()
  
  try {
    // Check if the invited user is already a member
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Check if user is already a member of the target partner
      const { data: existingMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMembership) {
        throw new Error('This user is already a member of this partner')
      }
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from('partner_invites')
      .select('id')
      .eq('email', email)
      .eq('partner_id', partnerId)
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
      .from('partner_invites')
      .insert({
        partner_id: partnerId,
        email,
        role,
        invited_by: invitedByUserId,
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
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://grady.app'}/invite/${invite.id}`
    
    try {
      // Get user profile for display name
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', invitedByUserId)
        .single()

      // Get partner name for email
      const { data: partnerData } = await supabase
        .from('partners')
        .select('name')
        .eq('id', partnerId)
        .single()

      const emailResult = await EmailService.sendInviteEmail({
        to: email,
        from: process.env.EMAIL_FROM_ADDRESS || 'noreply@eventably.com',
        inviterName: userProfile?.full_name || 'Admin',
        environmentName: partnerData?.name || 'Partner',
        inviteUrl,
        role
      })
      
      return { 
        success: true, 
        inviteId: invite.id, 
        inviteUrl,
        emailSent: emailResult.success !== false
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the entire operation if email fails
      return { 
        success: true, 
        inviteId: invite.id, 
        inviteUrl,
        emailSent: false
      }
    }
  } catch (error) {
    console.error('Error in inviteMemberDirect:', error)
    throw error
  }
}
